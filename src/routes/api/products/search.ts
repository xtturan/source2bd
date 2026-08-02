import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";
import {
  consumeQuota,
  QuotaError,
  AuthRequiredError,
  limitFor,
  nextDhakaMidnight,
} from "@/lib/api/quota.server";

const schema = z.object({
  q: z.string().trim().max(100).default(""),
  marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]).default("1688"),
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
        try {
          const data = await cached(`search:${marketplace}:${q}:${page}`, async () => {
            await consumeQuota("search", 1);
            return getProductProvider().search(q, { marketplace, page });
          });
          return Response.json(data);
        } catch (err) {
          if (err instanceof AuthRequiredError) {
            return Response.json(
              { ok: false, code: err.code, messageBn: err.messageBn },
              { status: 401 },
            );
          }
          if (err instanceof QuotaError) {
            return Response.json(
              {
                ok: false,
                code: err.code,
                limit: err.limit,
                remaining: 0,
                resetAt: err.resetAt,
                messageBn: err.messageBn,
              },
              {
                status: 429,
                headers: {
                  "X-RateLimit-Limit": String(err.limit),
                  "X-RateLimit-Remaining": "0",
                  "X-RateLimit-Reset": err.resetAt,
                },
              },
            );
          }
          console.error("search failed", err);
          return Response.json(
            { ok: false, code: "UPSTREAM_UNAVAILABLE", messageBn: providerFallbackMessage },
            { status: 502 },
          );
        }
      },
    },
  },
});
