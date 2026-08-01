import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";

const schema = z.object({
  q: z.string().trim().max(120).default(""),
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
          page: url.searchParams.get("page") ?? 1,
        });
        if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 });

        const { q, page } = parsed.data;
        try {
          const data = await cached(`search:${q}:${page}`, () =>
            getProductProvider().search(q, page),
          );
          return Response.json(data);
        } catch {
          return Response.json({ error: "Product search is unavailable right now." }, { status: 502 });
        }
      },
    },
  },
});