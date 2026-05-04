// fallow-ignore-file coverage-gaps
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_CONVEX_URL?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PUBLIC_APP_URL?: string;
    readonly RESEND_API_KEY?: string;
    readonly RESEND_FROM_EMAIL?: string;
    readonly STRIPE_SECRET_KEY?: string;
  }
}
