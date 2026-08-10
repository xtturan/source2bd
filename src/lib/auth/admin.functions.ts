import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("FORBIDDEN");
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  signupMethod: string;
  createdAt: string;
  isAdmin: boolean;
  devices: number;
};

/** Everything the owner needs on one screen: users, searches, usage. */
export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { dhakaDay, DAILY_LIMIT } = await import("@/lib/api/quota.server");

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [profilesRes, rolesRes, devicesRes, usageRes, cacheRes, errorsRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, phone, full_name, signup_method, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("device_accounts").select("device_hash, user_id"),
      supabaseAdmin.from("daily_usage").select("visitor_key, day, used").eq("day", dhakaDay()),
      supabaseAdmin
        .from("search_cache")
        .select("query, marketplace, item_count, hits, updated_at")
        .order("updated_at", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("system_errors")
        .select("id, scope, message, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

    const admins = new Set(
      (rolesRes.data ?? []).filter((r) => r.role === "admin").map((r) => r.user_id),
    );
    const deviceCount = new Map<string, number>();
    for (const row of devicesRes.data ?? []) {
      deviceCount.set(row.user_id, (deviceCount.get(row.user_id) ?? 0) + 1);
    }
    const usage = usageRes.data ?? [];
    const usageByUser = new Map<string, number>();
    for (const row of usage) {
      if (row.visitor_key.startsWith("user:")) {
        usageByUser.set(row.visitor_key.slice(5), row.used);
      }
    }

    const users: Array<AdminUserRow & { usedToday: number }> = (profilesRes.data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      phone: p.phone,
      fullName: p.full_name,
      signupMethod: p.signup_method,
      createdAt: p.created_at,
      isAdmin: admins.has(p.id),
      devices: deviceCount.get(p.id) ?? 0,
      usedToday: usageByUser.get(p.id) ?? 0,
    }));

    const errors = (errorsRes.data ?? []).map((e) => ({
      id: e.id as string,
      scope: e.scope as string,
      message: e.message as string,
      detail: (e.detail as string | null) ?? null,
      createdAt: e.created_at as string,
    }));

    return {
      limit: DAILY_LIMIT,
      day: dhakaDay(),
      totals: {
        users: users.length,
        newToday: users.filter((u) => u.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
        lookupsToday: usage.reduce((sum, r) => sum + r.used, 0),
        guestsToday: usage.filter((r) => !r.visitor_key.startsWith("user:")).length,
        cachedSearches: cacheRes.data?.length ?? 0,
        errors24h: errors.filter((e) => e.createdAt >= since24h).length,
      },
      users,
      errors,
      searches: (cacheRes.data ?? []).map((s) => ({
        query: s.query,
        marketplace: s.marketplace,
        items: s.item_count,
        hits: s.hits,
        updatedAt: s.updated_at,
      })),
    };
  });

/** Reset a customer's daily allowance, or block them by filling it up. */
export const adminSetUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ userId: z.string().uuid(), used: z.number().int().min(0).max(10_000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { dhakaDay } = await import("@/lib/api/quota.server");
    await supabaseAdmin
      .from("daily_usage")
      .upsert(
        { visitor_key: `user:${data.userId}`, day: dhakaDay(), used: data.used },
        { onConflict: "visitor_key,day" },
      );
    return { ok: true };
  });

/** Remove an account entirely (profile, roles and device links cascade). */
export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (data.userId === context.userId) throw new Error("CANNOT_DELETE_SELF");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type ActivityRow = {
  id: string;
  createdAt: string;
  kind: string;
  userId: string | null;
  ip: string | null;
  userAgent: string | null;
  detail: string | null;
  allowed: boolean;
  reason: string | null;
};

export type BlockRow = {
  id: string;
  subjectType: "user" | "ip";
  subject: string;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
};

/** Request trail for troubleshooting attacks: filterable by user, IP or status. */
export const adminActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        onlyBlocked: z.boolean().default(false),
        kind: z.string().max(20).optional(),
        search: z.string().trim().max(120).default(""),
        limit: z.number().int().min(10).max(500).default(200),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("activity_log")
      .select("id, created_at, kind, user_id, ip, user_agent, detail, allowed, reason")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.onlyBlocked) query = query.eq("allowed", false);
    if (data.kind) query = query.eq("kind", data.kind);
    if (data.search) {
      const term = data.search.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`ip.ilike.%${term}%,detail.ilike.%${term}%,user_id.eq.${term}`);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events: ActivityRow[] = (rows ?? []).map((r) => ({
      id: r.id as string,
      createdAt: r.created_at as string,
      kind: r.kind as string,
      userId: (r.user_id as string | null) ?? null,
      ip: (r.ip as string | null) ?? null,
      userAgent: (r.user_agent as string | null) ?? null,
      detail: (r.detail as string | null) ?? null,
      allowed: Boolean(r.allowed),
      reason: (r.reason as string | null) ?? null,
    }));

    const topIps = new Map<string, number>();
    for (const e of events) {
      if (!e.ip) continue;
      topIps.set(e.ip, (topIps.get(e.ip) ?? 0) + 1);
    }

    return {
      events,
      blocked24h: events.filter((e) => !e.allowed && e.createdAt >= since24h).length,
      requests24h: events.filter((e) => e.createdAt >= since24h).length,
      topIps: [...topIps.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ip, count]) => ({ ip, count })),
    };
  });

/** Everyone currently blocked. */
export const adminBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BlockRow[]> => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("abuse_blocks")
      .select("id, subject_type, subject, reason, expires_at, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id as string,
      subjectType: r.subject_type as "user" | "ip",
      subject: r.subject as string,
      reason: (r.reason as string | null) ?? null,
      expiresAt: (r.expires_at as string | null) ?? null,
      createdAt: r.created_at as string,
    }));
  });

/** Block an account or an IP address. */
export const adminBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subjectType: z.enum(["user", "ip"]),
        subject: z.string().trim().min(2).max(120),
        reason: z.string().trim().max(200).optional(),
        hours: z.number().int().min(0).max(24 * 365).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (data.subjectType === "user" && data.subject === context.userId) {
      throw new Error("CANNOT_BLOCK_SELF");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { forgetBlockCache } = await import("@/lib/api/abuse.server");
    const { error } = await supabaseAdmin.from("abuse_blocks").upsert(
      {
        subject_type: data.subjectType,
        subject: data.subject,
        reason: data.reason ?? null,
        created_by: context.userId,
        expires_at:
          data.hours > 0 ? new Date(Date.now() + data.hours * 3600_000).toISOString() : null,
      },
      { onConflict: "subject_type,subject" },
    );
    if (error) throw new Error(error.message);
    forgetBlockCache();
    return { ok: true };
  });

/** Lift a block. */
export const adminUnblock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { forgetBlockCache } = await import("@/lib/api/abuse.server");
    const { error } = await supabaseAdmin.from("abuse_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    forgetBlockCache();
    return { ok: true };
  });
