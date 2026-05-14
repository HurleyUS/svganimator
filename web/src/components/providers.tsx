// fallow-ignore-file coverage-gaps
import { lazy, type ReactNode, Suspense } from "react";
import { convex } from "../lib/convex";
import { initPostHog } from "../lib/posthog";
import { initSentry } from "../lib/sentry";

initSentry();
initPostHog();
void convex;

const LazyClerkProvider = lazy(async () => {
  const clerk = await import("@clerk/tanstack-react-start");

  return {
    default: clerk.ClerkProvider,
  };
});

/** Wraps the web app with optional third-party runtime providers. */
export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return children;
  }

  return (
    <Suspense fallback={children}>
      <LazyClerkProvider publishableKey={publishableKey}>
        {children}
      </LazyClerkProvider>
    </Suspense>
  );
}
