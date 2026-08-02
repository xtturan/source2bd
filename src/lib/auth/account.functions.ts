import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** One phone/laptop may open at most two accounts. */
export const MAX_ACCOUNTS_PER_DEVICE = 2;

async function hashDevice(id: string) {
  const bytes = new TextEncoder().encode(`s2bd-device|${id}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

/** How many accounts this browser has already created. Called before signup. */
export const deviceCapacity = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ deviceId: z.string().min(4).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await hashDevice(data.deviceId);
    const { data: rows } = await supabaseAdmin
      .from("device_accounts")
      .select("user_id")
      .eq("device_hash", hash);
    const used = new Set((rows ?? []).map((r) => r.user_id)).size;
    return { used, limit: MAX_ACCOUNTS_PER_DEVICE, allowed: used < MAX_ACCOUNTS_PER_DEVICE };
  });

/**
 * Runs right after sign up / sign in: stores the profile, grants the base role,
 * and binds the account to the device. Over the device cap the fresh account is
 * removed again so the limit cannot be walked around.
 */
export const claimAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        deviceId: z.string().min(4).max(120),
        phone: z.string().trim().max(24).optional(),
        fullName: z.string().trim().max(80).optional(),
        signupMethod: z.enum(["email", "phone"]).default("email"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ADMIN_EMAIL } = await import("./admin-config");
    const userId = context.userId;
    const email = (context.claims as { email?: string } | undefined)?.email ?? null;
    const hash = await hashDevice(data.deviceId);

    const { data: rows } = await supabaseAdmin
      .from("device_accounts")
      .select("user_id")
      .eq("device_hash", hash);
    const others = new Set((rows ?? []).map((r) => r.user_id));
    if (!others.has(userId) && others.size >= MAX_ACCOUNTS_PER_DEVICE) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("DEVICE_ACCOUNT_LIMIT");
    }

    await supabaseAdmin.from("device_accounts").upsert(
      { device_hash: hash, user_id: userId },
      { onConflict: "device_hash,user_id" },
    );

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        phone: data.phone ?? null,
        full_name: data.fullName ?? null,
        signup_method: data.signupMethod,
      },
      { onConflict: "id" },
    );

    const roles: Array<"admin" | "user"> = ["user"];
    if (email && email.toLowerCase() === ADMIN_EMAIL) roles.push("admin");
    await supabaseAdmin
      .from("user_roles")
      .upsert(roles.map((role) => ({ user_id: userId, role })), { onConflict: "user_id,role" });

    return { ok: true, isAdmin: roles.includes("admin") };
  });

/** Profile + role for the signed in visitor. */
export const myAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, email, phone, full_name, signup_method, created_at")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { profile, isAdmin: Boolean(isAdmin) };
  });
