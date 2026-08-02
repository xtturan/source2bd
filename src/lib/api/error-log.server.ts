/**
 * Upstream failure log.
 *
 * Anything that breaks outside our control (marketplace API down, photo
 * upload rejected, quota RPC failing) is written here so the owner can see it
 * on /admin instead of guessing from customer complaints. Writing is always
 * best effort: logging must never break the shopper's request.
 */

const RETAIN_MS = 14 * 24 * 60 * 60 * 1000;
let lastPrune = 0;

function reason(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "unknown error";
  }
}

/** Record one upstream failure. Never throws. */
export async function logIncident(
  scope: string,
  err: unknown,
  detail?: string,
): Promise<void> {
  const message = reason(err).slice(0, 400);
  console.error(`[${scope}]`, message, detail ?? "");
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("system_errors").insert({
      scope,
      message,
      detail: detail ? detail.slice(0, 1000) : null,
    });
    void pruneIncidents();
  } catch {
    /* logging is best effort */
  }
}

/** Fire-and-forget helper for call sites that must not await. */
export function noteIncident(scope: string, err: unknown, detail?: string) {
  void logIncident(scope, err, detail);
}

async function pruneIncidents() {
  if (Date.now() - lastPrune < 6 * 60 * 60 * 1000) return;
  lastPrune = Date.now();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("system_errors")
      .delete()
      .lt("created_at", new Date(Date.now() - RETAIN_MS).toISOString());
  } catch {
    /* best effort */
  }
}
