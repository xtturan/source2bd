import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/probe3")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { field } = (await request.json()) as { field: string };
        const src = await fetch("https://cbu01.alicdn.com/img/ibank/O1CN01NOQUUq2HyMKHa7gGb_!!2218065979219-0-cib.jpg");
        const buf = await src.arrayBuffer();
        const fd = new FormData();
        fd.append(field, new Blob([buf], { type: "image/jpeg" }), "photo.jpg");
        const res = await fetch("https://openapi.elim.asia/v1/products/upload-image", {
          method: "POST",
          headers: { "x-api-key": process.env["ELIM_API_KEY"] ?? "" },
          body: fd,
        });
        return new Response((await res.text()).slice(0, 800), { status: res.status });
      },
    },
  },
});
