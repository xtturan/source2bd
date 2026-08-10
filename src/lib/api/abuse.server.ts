/**
 * Abuse protection + audit trail.
 *
 * Every gated action (keyword search, photo search, product detail, link
 * resolve) and every auth event passes through here. Two jobs:
 *   1. refuse the request when the account or the IP sits on the block list;
 *   2. write one row to `activity_log` so the owner can reconstruct what a
 *      given user or IP did when something looks like an attack.
 *
 * Logging is best effort and must never break a real customer's request.
 */

import { getRequest } from "@tanstack/react-start/server";

export type ActivityKind =
  | "search"
  | "photo"
  | "detail"
  | "link"
  | "signin"
  | "signup"
  | "device_limit";

export class BlockedError extends Error {
  readonly code = "BLOCKED";
  readonly messageBn =
    "এই অ্যাকাউন্ট বা ডিভাইস সাময়িকভাবে বন্ধ করা হয়েছে। সাহায্যের জন্য WhatsApp-এ যোগাযোগ করুন।";
  constructor(public readonly reason: string | null = null) {
    super("BLOCKED");
    this.name = "BlockedError";
  }
}

export interface ClientMeta {
  ip: string | null;
  userAgent: string | null;
}

/** Caller IP + user agent, as seen by the edge. */
export function clientMeta(): ClientMeta {
  try {
    const request = getRequest();
    const headers = request?.headers;
    const ip =
      headers?.get("cf-connecting-ip") ??
      headers?.get("x-real-ip") ??
      headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;
    return {
      ip: ip || null,
      userAgent: headers?.get("user-agent")?.slice(0, 200) ?? null,
    };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/** Short-lived cache so a burst of requests does not hammer the block table. */
const blockCache = new Map<string, { reason: string | null; blocked: boolean; expires: number }>();
const BLOCK_TTL = 30_000;

/** Returns the block reason when user or IP is blocked, otherwise null. */
export async function blockReason(userId: string | null): Promise<string | null> {
  const { ip } = clientMeta();
  const key = `${userId ?? "-"}|${ip ?? "-"}`;
  const now = Date.now();
  const hit = blockCache.get(key);
  if (hit && hit.expires > now) return hit.blocked ? hit.reason : null;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const subjects: string[] = [];
    if (userId) subjects.push(userId);
    if (ip) subjects.push(ip);
    if (subjects.length === 0) return null;

    const { data, error } = await supabaseAdmin
      .from("abuse_blocks")
      .select("subject, subject_type, reason, expires_at")
      .in("subject", subjects);
    if (error) throw error;

    const active = (data ?? []).find(
      (row) =>
        (!row.expires_at || new Date(row.expires_at).getTime() > now) &&
        ((row.subject_type === "user" && row.subject === userId) ||
          (row.subject_type === "ip" && row.subject === ip)),
    );
    blockCache.set(key, {
      blocked: Boolean(active),
      reason: active?.reason ?? null,
      expires: now + BLOCK_TTL,
    });
    if (blockCache.size > 2000) blockCache.clear();
    return active ? (active.reason ?? "blocked") : null;
  } catch {
    // Never lock real customers out because the block table is unreachable.
    return null;
  }
}

/** Throws BlockedError when the caller is on the block list. */
export async function assertNotBlocked(userId: string | null): Promise<void> {
  const reason = await blockReason(userId);
  if (reason !== null) throw new BlockedError(reason);
}

/** Clears the in-process cache after an admin adds or lifts a block. */
export function forgetBlockCache() {
  blockCache.clear();
}

export interface ActivityEntry {
  kind: ActivityKind;
  userId?: string | null;
  detail?: string | null | undefined;
  allowed?: boolean;
  reason?: string | null | undefined;
}

/** Write one audit row. Never throws. */
export async function logActivity(entry: ActivityEntry): Promise<void> {
  try {
    const { ip, userAgent } = clientMeta();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("activity_log").insert({
      kind: entry.kind,
      user_id: entry.userId ?? null,
      ip,
      user_agent: userAgent,
      detail: entry.detail ? entry.detail.slice(0, 300) : null,
      allowed: entry.allowed ?? true,
      reason: entry.reason ?? null,
    });
    void pruneActivity();
  } catch {
    /* audit logging is best effort */
  }
}

/** Fire-and-forget variant for hot paths. */
export function noteActivity(entry: ActivityEntry) {
  void logActivity(entry);
}

const RETAIN_MS = 30 * 24 * 60 * 60 * 1000;
let lastPrune = 0;

async function pruneActivity() {
  if (Date.now() - lastPrune < 6 * 60 * 60 * 1000) return;
  lastPrune = Date.now();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("activity_log")
      .delete()
      .lt("created_at", new Date(Date.now() - RETAIN_MS).toISOString());
  } catch {
    /* best effort */
  }
}