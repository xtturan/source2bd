import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rateLimited, tooMany } from "@/lib/api/guard.server";
import { readSearchCache } from "@/lib/products/search-cache.server";
import { canonicalQuery } from "@/lib/products/bn-keywords";

const schema = z.object({
  q: z.string().trim().max(100).default(""),
  marketplace: z
    .enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"])
    .default("1688"),
  page: z.coerce.number().int().min(1).max(50).default(1),
});

export const Route = createFileRoute("/api/products/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        const url = new URL(request.url);
        const parsed = schema.safeParse({
          q: url.searchParams.get("q") ?? "",
          marketplace: url.searchParams.get("marketplace") ?? "1688",
          page: url.searchParams.get("page") ?? 1,
        });
        if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 });

        const { q, marketplace, page } = parsed.data;
        // Same canonical form the search function writes, so Bangla queries
        // hit the cache entry their English equivalent already warmed.
        const data = await readSearchCache(canonicalQuery(q), marketplace, page);
        return data
          ? Response.json(data, { headers: { "Cache-Control": "public, max-age=300" } })
          : Response.json({ ok: false, code: "CACHE_MISS" }, { status: 404 });
      },
    },
  },
});
