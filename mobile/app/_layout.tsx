/**
 * Mobile App Layout public module surface.
 */
// fallow-ignore-file coverage-gaps
import { Stack } from "expo-router";
import { MobileObservabilityProvider, initMobileObservability } from "../src/observability";

/** Root Expo Router layout for the mobile workspace. */
export default function Layout() {
  initMobileObservability();

  return (
    <MobileObservabilityProvider>
      <Stack />
    </MobileObservabilityProvider>
  );
}
