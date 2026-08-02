/**
 * 1688 and Taobao index their listings in Simplified Chinese, so an English
 * keyword search matches almost nothing specific ("red light" returns generic
 * lamps). We translate the typed phrase into shopping keywords once, cache it,
 * and send that to the marketplace. Titles still come back in English.
 */

const cache = new Map<string, string>();
const MODEL = "google/gemini-3.1-flash-lite";

/**
 * Colour words plus a lighting noun must never go through the model. "blue
 * light" paraphrases to 蓝光, which on 1688 means anti-blue-light screen film
 * and glasses, not a blue lamp. Compose the keyword ourselves instead.
 */
const colours: Record<string, string> = {
  red: "红色",
  blue: "蓝色",
  green: "绿色",
  yellow: "黄色",
  white: "白色",
  black: "黑色",
  purple: "紫色",
  pink: "粉色",
  orange: "橙色",
  golden: "金色",
  gold: "金色",
  silver: "银色",
};

// noun phrase (after the colour) -> Chinese head noun
const lightNouns: Record<string, string> = {
  light: "灯",
  lights: "灯",
  lamp: "灯",
  lamps: "灯",
  "light bulb": "灯泡",
  "light bulbs": "灯泡",
  bulb: "灯泡",
  bulbs: "灯泡",
  "led light": "LED灯",
  "led lights": "LED灯",
  "led lamp": "LED灯",
  "led bulb": "LED灯泡",
  "led bulbs": "LED灯泡",
  "light strip": "灯带",
  "light strips": "灯带",
  "led strip": "LED灯带",
  "strip light": "灯带",
  "strip lights": "灯带",
  "string light": "串灯",
  "string lights": "串灯",
  "night light": "小夜灯",
  "night lights": "小夜灯",
};

// Exact overrides that beat the composed form on 1688.
const exactQueries: Record<string, string> = {
  "red light": "红灯",
  "red lights": "红灯",
};

/** "blue led light" -> 蓝色LED灯 when the phrase is colour + lighting noun. */
function colourLight(key: string): string | undefined {
  const [first, ...rest] = key.split(/\s+/);
  const colour = first ? colours[first] : undefined;
  const noun = rest.length ? lightNouns[rest.join(" ")] : undefined;
  if (!colour || !noun) return undefined;
  return `${colour}${noun}`;
}

const hasCjk = (q: string) => /[\u4e00-\u9fff]/.test(q);

export async function toChineseQuery(query: string): Promise<string> {
  const q = query.trim();
  if (!q || hasCjk(q)) return q;

  const key = q.toLowerCase();
  const exact = exactQueries[key];
  if (exact) return exact;
  const composed = colourLight(key);
  if (composed) return composed;
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
              "You convert shopping searches into Simplified Chinese keywords used on 1688 and Taobao. Keep every qualifier such as colour, size and material, and keep the head noun the shopper actually wants to buy. Never turn a colour plus an object into a technical or optical term: for example a blue lamp is 蓝色灯, never 蓝光 or 防蓝光. Reply with the keywords only, no punctuation, no explanation.",
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
