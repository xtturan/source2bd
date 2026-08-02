import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";

const schema = z.object({
  imageUrl: z.string().trim().min(4).max(2000),
  marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]).default("global"),
});

export const Route = createFileRoute("/api/products/by-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Send a JSON body" }, { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success)
          return Response.json({ error: "Upload a photo first" }, { status: 400 });

        const provider = getProductProvider();
        if (!provider.searchByImage)
          return Response.json({ error: providerFallbackMessage }, { status: 501 });

        try {
          const { imageUrl, marketplace } = parsed.data;
          const data = await cached(`image:${marketplace}:${imageUrl.slice(0, 200)}`, () =>
            provider.searchByImage!(imageUrl, { marketplace }),
          );
          return Response.json(data);
        } catch (err) {
          console.error("image search failed", err);
          return Response.json({ error: providerFallbackMessage }, { status: 502 });
        }
      },
    },
  },
});
