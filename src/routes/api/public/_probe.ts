import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/_probe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { path, body } = (await request.json()) as { path: string; body: unknown };
        const res = await fetch(`https://openapi.elim.asia${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": process.env["ELIM_API_KEY"] ?? "" },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        return new Response(text.slice(0, 4000), { status: res.status });
      },
    },
  },
});
