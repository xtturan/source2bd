/**
 * Chinese to English translation for live marketplace data.
 * Uses the Lovable AI Gateway with one batched request per product page,
 * plus a process level cache so repeated strings are free.
 */
import type { ProductDetail } from "./types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-5.6-sol";

const memo = new Map<string, string>();
const CJK = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;

export function hasChinese(v: string | undefined): v is string {
  return typeof v === "string" && CJK.test(v);
}

/** Translates a batch of Chinese strings. Returns the input on any failure. */
export async function translateBatch(inputs: string[]): Promise<string[]> {
  const key = process.env["LOVABLE_API_KEY"];
  const pending = [...new Set(inputs.filter((s) => hasChinese(s) && !memo.has(s)))];
  if (!key || pending.length === 0) return inputs.map((s) => memo.get(s) ?? s);

  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: MODEL,
        reasoning_effort: "none",
        messages: [
          {
            role: "system",
            content:
              "You translate Chinese e-commerce text into natural English for a B2B sourcing site. Keep it short, keep product terms and brand names, convert sales phrases like 已售500+件 into '500+ sold', and convert place names into pinyin English (广东 深圳市 -> Guangdong, Shenzhen). Reply with a JSON object {\"out\":[...]} whose array has exactly the same length and order as the input array. No commentary.",
          },
          { role: "user", content: JSON.stringify({ in: pending }) },
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      console.error(`translate failed [${res.status}]: ${await res.text()}`);
      return inputs.map((s) => memo.get(s) ?? s);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const out = (JSON.parse(content) as { out?: unknown }).out;
    if (Array.isArray(out) && out.length === pending.length) {
      pending.forEach((src, i) => {
        const v = out[i];
        if (typeof v === "string" && v.trim()) memo.set(src, v.trim());
      });
    }
  } catch (err) {
    console.error("translate error", err);
  }

  return inputs.map((s) => memo.get(s) ?? s);
}

/** Translates the user visible Chinese fields of a set of products in place. */
export async function translateProducts<T extends Partial<ProductDetail>>(
  products: T[],
): Promise<T[]> {
  const sources: string[] = [];
  const collect = (v: string | undefined) => {
    if (hasChinese(v)) sources.push(v);
  };

  for (const p of products) {
    collect(p.title);
    collect(p.shopName);
    collect(p.city);
    collect(p.ordersHint);
    collect(p.description?.slice(0, 1200));
    for (const a of p.attributes ?? []) {
      collect(a.label);
      collect(a.value);
    }
  }
  if (sources.length === 0) return products;

  const translated = await translateBatch(sources);
  const map = new Map(sources.map((s, i) => [s, translated[i] ?? s]));
  const t = (v: string | undefined) => (hasChinese(v) ? (map.get(v) ?? v) : v);

  for (const p of products) {
    const m = p as Record<string, unknown>;
    if (hasChinese(p.title)) m["title"] = t(p.title);
    if (hasChinese(p.shopName)) m["shopName"] = t(p.shopName);
    if (hasChinese(p.city)) m["city"] = t(p.city);
    if (hasChinese(p.ordersHint)) m["ordersHint"] = t(p.ordersHint);
    if (hasChinese(p.description)) m["description"] = t(p.description.slice(0, 1200));
    if (p.attributes) {
      m["attributes"] = p.attributes.map((a) => ({
        label: t(a.label) ?? a.label,
        value: t(a.value) ?? a.value,
      }));
    }
  }
  return products;
}
