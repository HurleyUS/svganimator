// fallow-ignore-file coverage-gaps
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

/** Validates environment variables that may be exposed to browser bundles. */
export const clientEnvSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  VITE_CONVEX_URL: z.string().url(),
  VITE_POSTHOG_HOST: optionalUrl,
  VITE_POSTHOG_KEY: z.string().optional().or(z.literal("")),
  VITE_SENTRY_DSN: optionalUrl,
});

/** Validates the complete server-side environment contract. */
export const serverEnvSchema = clientEnvSchema.extend({
  APP_NAME: z.string().min(1),
  CLERK_FRONTEND_API_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  CONVEX_DEPLOYMENT: z.string().min(1),
  PUBLIC_APP_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  SENTRY_DSN: optionalUrl,
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

/** Browser-safe environment shape inferred from the client schema. */
export type ClientEnv = z.infer<typeof clientEnvSchema>;
/** Full server environment shape inferred from the server schema. */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parses a browser-safe environment source. */
export function readClientEnv(
  source: Record<string, string | undefined>,
): ClientEnv {
  return clientEnvSchema.parse(source);
}

/** Parses a server environment source. */
export function readServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  return serverEnvSchema.parse(source);
}
