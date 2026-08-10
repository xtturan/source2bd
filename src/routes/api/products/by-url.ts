import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany, abuseResponse } from "@/lib/api/guard.server";
import { consumeQuota } from "@/lib/api/quota.server";
import { assertSafeUrl, UnsafeUrlError } from "@/lib/api/url-guard.server";

const schema = z.object({ url: z.string().trim().url().max(2048) });

export const Route = createFileRoute("/api/products/by-url")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        const reqUrl = new URL(request.url);
        const parsed = schema.safeParse({ url: reqUrl.searchParams.get("url") ?? "" });
        if (!parsed.success)
          return Response.json(
            { error: "That does not look like a full product link. Paste the whole URL." },
            { status: 400 },
          );

        try {
          const safe = assertSafeUrl(parsed.data.url);
          const item = await cached(`by-url:${safe}`, async () => {
            await consumeQuota("link", 1, `api ${safe}`);
            return getProductProvider().getByUrl(safe);
          });
          if (!item) return Response.json({ error: "Could not read that link" }, { status: 404 });
          return Response.json({ item });
        } catch (err) {
          if (err instanceof UnsafeUrlError) {
            return Response.json(
              { ok: false, code: err.code, messageBn: err.messageBn },
              { status: 400 },
            );
          }
          const handled = await abuseResponse(err);
          if (handled) return handled;
          console.error("by-url failed", err);
          return Response.json({ error: providerFallbackMessage }, { status: 502 });
        }
      },
    },
  },
});