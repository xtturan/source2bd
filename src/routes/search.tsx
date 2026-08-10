import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias for older links and typed URLs: searching happens on /sourcing. */
export const Route = createFileRoute("/search")({
  beforeLoad: () => {
    throw redirect({ to: "/sourcing", replace: true });
  },
});
