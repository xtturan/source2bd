import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";

const schema = z.object({ url: z.string().trim().url().max(600) });

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
          const item = await cached(`by-url:${parsed.data.url}`, () =>
            getProductProvider().getByUrl(parsed.data.url),
          );
          if (!item) return Response.json({ error: "Could not read that link" }, { status: 404 });
          return Response.json({ item });
        } catch (err) {
          console.error("by-url failed", err);
          return Response.json({ error: providerFallbackMessage }, { status: 502 });
        }
      },
    },
  },
});