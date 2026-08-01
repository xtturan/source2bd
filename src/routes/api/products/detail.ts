import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";

const schema = z.object({
  id: z.string().trim().min(1).max(64),
  source: z.enum(["1688", "alibaba"]).default("1688"),
});

export const Route = createFileRoute("/api/products/detail")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        const url = new URL(request.url);
        const parsed = schema.safeParse({
          id: url.searchParams.get("id") ?? "",
          source: url.searchParams.get("source") ?? "1688",
        });
        if (!parsed.success) return Response.json({ error: "Invalid product id" }, { status: 400 });

        const { id, source } = parsed.data;
        try {
          const item = await cached(`detail:${source}:${id}`, () =>
            getProductProvider().getById(id, source),
          );
          if (!item) return Response.json({ error: "Product not found" }, { status: 404 });
          return Response.json({ item });
        } catch {
          return Response.json({ error: "Product lookup is unavailable right now." }, { status: 502 });
        }
      },
    },
  },
});