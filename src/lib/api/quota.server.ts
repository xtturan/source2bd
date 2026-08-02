import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

/**
 * Per-user daily quota.
 *
 * One counter per signed-in account per Dhaka calendar day, per action.
 * Keyword search and photo search share ONE "search" pot; product detail and
 * link resolve have their own smaller pots. Identity comes from the verified
 * bearer token only — nothing the client sends in a body can change it.
 */

function envInt(name: string, fallback: number) {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type QuotaAction = "search" | "detail" | "link";

export function limitFor(action: QuotaAction) {
  if (action === "search") return envInt("DAILY_SEARCH_LIMIT", 30);
  if (action === "detail") return envInt("DAILY_DETAIL_LIMIT", 60);
  return envInt("DAILY_LINK_RESOLVE_LIMIT", 30);
}

export function burstLimit() {
  return envInt("BURST_SEARCH_LIMIT_PER_MIN", 8);
}

/** Kept for older imports; the search pot is the headline number. */
export const DAILY_LIMIT = 30;

export const LIMIT_MESSAGE_BN =
  "আজকের খোঁজার সীমা শেষ। একজন ইউজার দিনে সর্বোচ্চ ৩০ বার খুঁজতে পারেন (লেখা ও ছবি মিলিয়ে)। কাল আবার চেষ্টা করুন অথবা WhatsApp/ফোনে যোগাযোগ করুন।";

export class QuotaError extends Error {
  readonly code: "DAILY_SEARCH_LIMIT" | "BURST_LIMIT";
  readonly limit: number;
  readonly remaining = 0;
  readonly resetAt: string;
  readonly messageBn: string;
  constructor(opts: { code?: "DAILY_SEARCH_LIMIT" | "BURST_LIMIT"; limit: number; resetAt: string }) {
    super(opts.code ?? "DAILY_SEARCH_LIMIT");
    this.name = "QuotaError";
    this.code = opts.code ?? "DAILY_SEARCH_LIMIT";
    this.limit = opts.limit;
    this.resetAt = opts.resetAt;
    this.messageBn =
      this.code === "BURST_LIMIT"
        ? "একটু ধীরে খুঁজুন। এক মিনিটে অনেকবার খোঁজা হয়েছে।"
        : LIMIT_MESSAGE_BN;
  }
}

export class AuthRequiredError extends Error {
  readonly code = "LOGIN_REQUIRED";
  readonly messageBn = "খুঁজতে লগইন করুন — দিনে ৩০ বার (লেখা+ছবি)।";
  constructor() {
    super("LOGIN_REQUIRED");
    this.name = "AuthRequiredError";
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

function bearerToken(): string | null {
  const request = getRequest();
  const auth = request?.headers?.get("authorization");
  if (!auth) return null;
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  return token && token.split(".").length === 3 ? token : null;
}

/** Owner escape hatch. The key never leaves the server. */
function hasBypass(): boolean {
  const expected = process.env["RATE_LIMIT_BYPASS_KEY"];
  if (!expected) return false;
  const request = getRequest();
  return request?.headers?.get("x-s2bd-bypass") === expected;
}

/** The verified user id from the session bearer token, or null. */
export async function currentUserId(): Promise<string | null> {
  try {
    const token = bearerToken();
    if (!token) return null;
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return null;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await client.auth.getUser(token);
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export interface QuotaState {
  limit: number;
  remaining: number;
  resetAt: string;
}

/** Read-only view of today's allowance for the signed-in user. */
export async function readQuota(action: QuotaAction = "search"): Promise<QuotaState | null> {
  const limit = limitFor(action);
  const userId = await currentUserId();
  if (!userId) return null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("read_user_usage", {
      _user_id: userId,
      _day: dhakaDay(),
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const used =
      action === "search"
        ? (row?.search_count ?? 0)
        : action === "detail"
          ? (row?.detail_count ?? 0)
          : (row?.link_count ?? 0);
    return { limit, remaining: Math.max(0, limit - used), resetAt: nextDhakaMidnight() };
  } catch (err) {
    console.error("quota read failed", err);
    return { limit, remaining: limit, resetAt: nextDhakaMidnight() };
  }
}

function setHeaders(state: QuotaState) {
  try {
    setResponseHeader("x-ratelimit-limit", String(state.limit));
    setResponseHeader("x-ratelimit-remaining", String(state.remaining));
    setResponseHeader("x-ratelimit-reset", state.resetAt);
  } catch {
    /* headers are best effort */
  }
}

/**
 * Books `cost` units of `action` against today's allowance for the signed-in
 * user. Throws AuthRequiredError when nobody is signed in and login is
 * required, QuotaError when the pot is empty.
 */
export async function consumeQuota(
  action: QuotaAction = "search",
  cost = 1,
): Promise<QuotaState> {
  const limit = limitFor(action);
  const resetAt = nextDhakaMidnight();

  if (hasBypass()) return { limit, remaining: limit, resetAt };

  // Only live keyword/photo search is gated behind login; opening a product
  // detail page or resolving a pasted link stays public and crawlable.
  const requireLogin =
    action === "search" && (process.env["REQUIRE_LOGIN_FOR_SEARCH"] ?? "true") !== "false";
  const userId = await currentUserId();

  if (!userId) {
    if (requireLogin) throw new AuthRequiredError();
    return { limit, remaining: limit, resetAt };
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("consume_user_usage", {
      _user_id: userId,
      _day: dhakaDay(),
      _action: action,
      _limit: limit,
      _cost: cost,
      _burst_limit: action === "search" ? burstLimit() : 0,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.allowed === false) {
      throw new QuotaError({
        code: row.reason === "burst" ? "BURST_LIMIT" : "DAILY_SEARCH_LIMIT",
        limit,
        resetAt,
      });
    }
    const state = {
      limit,
      remaining: Math.max(0, limit - (row?.used ?? 0)),
      resetAt,
    };
    setHeaders(state);
    console.info(
      `quota ${action} allowed user=${userId.slice(0, 8)} remaining=${state.remaining}`,
    );
    return state;
  } catch (err) {
    if (err instanceof QuotaError) throw err;
    // Counter store unreachable: let a real customer through rather than block.
    console.error("quota check failed", err);
    return { limit, remaining: limit, resetAt };
  }
}
