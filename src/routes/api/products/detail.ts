import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";

const schema = z.object({
  id: z.string().trim().min(1).max(64),
  marketplace: z.enum(["1688", "alibaba", "amazon", "global"]).default("1688"),
});

export const Route = createFileRoute("/api/products/detail")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        const url = new URL(request.url);
        const parsed = schema.safeParse({
          id: url.searchParams.get("id") ?? "",
          marketplace: url.searchParams.get("marketplace") ?? "1688",
        });
        if (!parsed.success) return Response.json({ error: "Invalid product id" }, { status: 400 });

        const { id, marketplace } = parsed.data;
        try {
          const item = await cached(`detail:${marketplace}:${id}`, () =>
            getProductProvider().getById(id, marketplace),
          );
          if (!item) return Response.json({ error: "Product not found" }, { status: 404 });
          return Response.json({ item });
        } catch (err) {
          console.error("detail failed", err);
          return Response.json({ error: providerFallbackMessage }, { status: 502 });
        }
      },
    },
  },
});
