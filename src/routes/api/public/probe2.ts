import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/probe2")({
  server: {
    handlers: {
      POST: async () => {
        const { searchByPhoto } = await import("@/lib/products/image-search.server");
        const src = await fetch("https://cbu01.alicdn.com/img/ibank/O1CN01NOQUUq2HyMKHa7gGb_!!2218065979219-0-cib.jpg");
        const b64 = Buffer.from(await src.arrayBuffer()).toString("base64");
        const res = await searchByPhoto(`data:image/jpeg;base64,${b64}`, "1688");
        return Response.json({ count: res.items.length, titles: res.items.slice(0, 5).map((i) => i.title) });
      },
    },
  },
});
