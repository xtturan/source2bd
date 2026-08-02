import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

/**
 * Daily live-lookup quota.
 *
 * One shared pot per visitor per Dhaka day: 30 live lookups covering keyword
 * search, photo search and link resolve. Cache hits never touch this — only
 * calls that actually cost us money upstream.
 */

export const DAILY_LIMIT = 30;

const COOKIE = "s2bd_vid";

export class QuotaError extends Error {
  readonly code = "DAILY_SEARCH_LIMIT";
  readonly limit = DAILY_LIMIT;
  readonly resetAt: string;
  constructor(resetAt: string) {
    super(
      "আজকের ফ্রি সার্চ শেষ। WhatsApp-এ মেসেজ দিন, আমরা এখনই দাম বের করে দেব। (Daily search limit reached — message us on WhatsApp.)",
    );
    this.name = "QuotaError";
    this.resetAt = resetAt;
  }
}

/** Calendar day in Asia/Dhaka (UTC+6), as YYYY-MM-DD. */
export function dhakaDay(now = new Date()) {
  return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Next Dhaka midnight, in ISO-8601 UTC. */
export function nextDhakaMidnight(now = new Date()) {
  const shifted = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  shifted.setUTCHours(24, 0, 0, 0);
  return new Date(shifted.getTime() - 6 * 60 * 60 * 1000).toISOString();
}

function readCookie(header: string | null, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

async function sha(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/** IP + a server-set http-only cookie, hashed so we never store raw IPs. */
async function visitorKey() {
  const request = getRequest();
  const headers = request.headers;
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ua = headers.get("user-agent") ?? "";

  let vid = readCookie(headers.get("cookie"), COOKIE);
  if (!vid || vid.length < 8 || vid.length > 64) {
    vid = crypto.randomUUID();
    setResponseHeader(
      "set-cookie",
      `${COOKIE}=${vid}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
    );
  }
  return sha(`${vid}|${ip}|${ua.slice(0, 80)}`);
}

/**
 * Books `cost` units against today's allowance. Throws QuotaError when the
 * visitor is out. If the counter store is unreachable we let the call through
 * rather than blocking a real customer.
 */
export async function consumeQuota(cost = 1): Promise<void> {
  try {
    const key = await visitorKey();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("consume_daily_usage", {
      _visitor_key: key,
      _day: dhakaDay(),
      _limit: DAILY_LIMIT,
      _cost: cost,
    });
    if (error) {
      console.error("quota check failed", error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.allowed === false) throw new QuotaError(nextDhakaMidnight());
  } catch (err) {
    if (err instanceof QuotaError) throw err;
    console.error("quota check failed", err);
  }
}