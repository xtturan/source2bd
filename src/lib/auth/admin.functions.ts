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

    const [profilesRes, rolesRes, devicesRes, usageRes, cacheRes] = await Promise.all([
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

    return {
      limit: DAILY_LIMIT,
      day: dhakaDay(),
      totals: {
        users: users.length,
        newToday: users.filter((u) => u.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
        lookupsToday: usage.reduce((sum, r) => sum + r.used, 0),
        guestsToday: usage.filter((r) => !r.visitor_key.startsWith("user:")).length,
        cachedSearches: cacheRes.data?.length ?? 0,
      },
      users,
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
