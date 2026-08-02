/**
 * 1688 and Taobao index their listings in Simplified Chinese, so an English
 * keyword search matches almost nothing specific ("red light" returns generic
 * lamps). We translate the typed phrase into shopping keywords once, cache it,
 * and send that to the marketplace. Titles still come back in English.
 */

const cache = new Map<string, string>();
const MODEL = "google/gemini-3.1-flash-lite";

// High-intent shopping phrases should be exact and must not depend on an AI
// paraphrase. On 1688, 红灯 returns red lamps while 红色灯 skews generic.
const exactQueries: Record<string, string> = {
  "red light": "红灯",
  "red lights": "红灯",
  "red led light": "红色LED灯",
  "red led lights": "红色LED灯",
  "red light bulb": "红色灯泡",
  "red light bulbs": "红色灯泡",
};

const hasCjk = (q: string) => /[\u4e00-\u9fff]/.test(q);

export async function toChineseQuery(query: string): Promise<string> {
  const q = query.trim();
  if (!q || hasCjk(q)) return q;

  const key = q.toLowerCase();
  const exact = exactQueries[key];
  if (exact) return exact;
  const hit = cache.get(key);
  if (hit) return hit;

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return q;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You convert shopping searches into Simplified Chinese keywords used on 1688 and Taobao. Keep every qualifier such as colour, size and material. Reply with the keywords only, no punctuation, no explanation.",
          },
          { role: "user", content: q },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return q;

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const out = json.choices?.[0]?.message?.content?.trim();
    if (!out || !hasCjk(out) || out.length > 40) return q;

    if (cache.size > 400) cache.clear();
    cache.set(key, out);
    return out;
  } catch {
    return q;
  }
}
