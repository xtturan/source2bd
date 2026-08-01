type Entry<T> = { value: T; expires: number };

const cache = new Map<string, Entry<unknown>>();
const CACHE_TTL = 15 * 60 * 1000;

export async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await fn();
  cache.set(key, { value, expires: now + CACHE_TTL });
  if (cache.size > 500) {
    for (const [k, v] of cache) if (v.expires <= now) cache.delete(k);
  }
  return value;
}

const WINDOW = 10 * 60 * 1000;
const LIMIT = 40;
const hits = new Map<string, number[]>();

export function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Returns true when the caller is over the limit. */
export function rateLimited(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

export function tooMany() {
  return Response.json(
    { error: "Too many requests. Please slow down or message us on WhatsApp." },
    { status: 429 },
  );
}