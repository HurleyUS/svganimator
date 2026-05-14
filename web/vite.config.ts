/**
 * Web Vite.config public module surface.
 */
// fallow-ignore-file coverage-gaps
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Vite configuration for TanStack Start and Tailwind v4. */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
