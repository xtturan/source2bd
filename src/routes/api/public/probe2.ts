import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/probe2")({
  server: {
    handlers: {
      POST: async () => {
        const { hostPhoto } = await import("@/lib/products/image-search.server");
        const fs = await import("node:fs/promises");
        const b = await fs.readFile("/mnt/user-uploads/image-7.png");
        const url = await hostPhoto(`data:image/png;base64,${b.toString("base64")}`);
        const res = await fetch("https://openapi.elim.asia/v1/products/search-img", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": process.env["ELIM_API_KEY"] ?? "" },
          body: JSON.stringify({ img_url: url, platform: "alibaba", page: 1, size: 3, lang: "en" }),
        });
        return Response.json({ urlHost: new URL(url).host, hasQuery: !!new URL(url).search, api: (await res.text()).slice(0, 600) });
      },
    },
  },
});
