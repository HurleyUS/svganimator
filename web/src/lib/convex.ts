/**
 * Web Src Lib Convex public module surface.
 */
// fallow-ignore-file coverage-gaps
import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

/** Browser Convex client, disabled until a Convex URL is configured. */
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
