/**
 * Web Src Router public module surface.
 */
// fallow-ignore-file coverage-gaps
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/** Creates the TanStack Router instance for Start. */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
