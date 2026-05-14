/**
 * Web Src Lib Posthog public module surface.
 */
// fallow-ignore-file coverage-gaps
/** Lazily initializes PostHog when a browser key is configured. */
export function initPostHog() {
  if (typeof window === "undefined" || !import.meta.env.VITE_POSTHOG_KEY) {
    return;
  }

  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY ?? "", {
      api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
    });
  });
}
