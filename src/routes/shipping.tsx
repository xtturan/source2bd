import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path kept alive: shipping cost questions belong on the quote page. */
export const Route = createFileRoute("/shipping")({
  beforeLoad: () => {
    throw redirect({ to: "/quote", replace: true });
  },
});
