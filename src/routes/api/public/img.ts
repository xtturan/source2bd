import { createFileRoute } from "@tanstack/react-router";

/**
 * Image proxy for marketplace CDNs that block hotlinking from other origins.
 * Only allows known marketplace image hosts.
 */
const ALLOWED = [
  "alicdn.com",
  "aliimg.com",
  "alibaba.com",
  "1688.com",
  "media-amazon.com",
  "ssl-images-amazon.com",
];

export const Route = createFileRoute("/api/public/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("u");
        if (!raw) return new Response("Missing url", { status: 400 });

        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return new Response("Bad url", { status: 400 });
        }
        if (target.protocol !== "https:" && target.protocol !== "http:")
          return new Response("Bad url", { status: 400 });
        const host = target.hostname.toLowerCase();
        if (!ALLOWED.some((d) => host === d || host.endsWith(`.${d}`)))
          return new Response("Host not allowed", { status: 403 });

        const upstream = await fetch(target.toString(), {
          headers: { Referer: `${target.protocol}//${host}/`, "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(15_000),
        });
        if (!upstream.ok || !upstream.body)
          return new Response("Upstream failed", { status: 502 });

        const type = upstream.headers.get("content-type") ?? "image/jpeg";
        if (!type.startsWith("image/")) return new Response("Not an image", { status: 415 });

        return new Response(upstream.body, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      },
    },
  },
});
