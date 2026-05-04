// fallow-ignore-file coverage-gaps
import { contextBridge } from "electron";

const desktopCapabilities = {
  platform: process.platform,
  runtime: "electron",
};

/** Desktop preload bridge for the shared SVG Animator renderer. */
contextBridge.exposeInMainWorld("svganimatorDesktop", desktopCapabilities);
