// fallow-ignore-file coverage-gaps

import { join } from "node:path";
import { appConfig } from "@canaveral/config";
import { app, BrowserWindow } from "electron";

const preloadPath = join(import.meta.dirname, "preload.ts");

async function createWindow() {
  const window = new BrowserWindow({
    backgroundColor: "#f8fafc",
    height: 960,
    minHeight: 720,
    minWidth: 1080,
    show: false,
    title: appConfig.name,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      sandbox: false,
    },
    width: 1440,
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  await window.loadURL(appConfig.url);
}

app.whenReady().then(() => {
  void createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
