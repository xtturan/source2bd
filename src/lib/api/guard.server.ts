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

/**
 * Turns the shared abuse/quota errors into the right HTTP response.
 * Returns null when the error is something else and should bubble up.
 */
export async function abuseResponse(err: unknown): Promise<Response | null> {
  const { BlockedError } = await import("./abuse.server");
  const { QuotaError, AuthRequiredError } = await import("./quota.server");

  if (err instanceof BlockedError) {
    return Response.json(
      { ok: false, code: err.code, messageBn: err.messageBn },
      { status: 403 },
    );
  }
  if (err instanceof AuthRequiredError) {
    return Response.json(
      { ok: false, code: err.code, messageBn: err.messageBn },
      { status: 401 },
    );
  }
  if (err instanceof QuotaError) {
    return Response.json(
      {
        ok: false,
        code: err.code,
        limit: err.limit,
        remaining: 0,
        resetAt: err.resetAt,
        messageBn: err.messageBn,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(err.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": err.resetAt,
        },
      },
    );
  }
  return null;
}