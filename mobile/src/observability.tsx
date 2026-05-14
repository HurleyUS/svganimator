/**
 * Mobile Src Observability public module surface.
 */
// fallow-ignore-file coverage-gaps
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let sentryInitialized = false;

/** Initialize mobile Sentry once when the Expo shell boots. */
export function initMobileObservability() {
  if (sentryInitialized) {
    return;
  }

  sentryInitialized = true;
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: process.env.NODE_ENV === "production" && !!SENTRY_DSN,
    tracesSampleRate: SENTRY_DSN ? 0.1 : 0,
  });
}

/** Provide PostHog only when the deployment has a public project key. */
export function MobileObservabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={{ host: POSTHOG_HOST }}>
      {children}
    </PostHogProvider>
  );
}
