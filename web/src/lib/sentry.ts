// fallow-ignore-file coverage-gaps
/** Lazily initializes Sentry when a browser DSN is configured. */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  });
}
