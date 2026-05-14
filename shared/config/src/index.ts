/**
 * Shared Config Src Index public module surface.
 */
// fallow-ignore-file coverage-gaps
import { z } from "zod";

/** Validates product-level configuration shared by all runtimes. */
export const appConfigSchema = z.object({
  name: z.string().min(1),
  supportEmail: z.string().email(),
  url: z.string().url(),
});

/** Shared application configuration shape. */
export type AppConfig = z.infer<typeof appConfigSchema>;

/** Default starter configuration for Canaveral apps. */
export const appConfig = appConfigSchema.parse({
  name: "SVG Animator",
  supportEmail: "support@svganimator.localhost",
  url: "http://localhost:3000",
});
