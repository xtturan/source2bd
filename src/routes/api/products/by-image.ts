import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rateLimited, tooMany } from "@/lib/api/guard.server";

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

        return Response.json(
          { ok: false, code: "USE_SIGNED_IN_PHOTO_SEARCH" },
          { status: 410 },
        );
      },
    },
  },
});
