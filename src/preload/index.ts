import { electronAPI } from '@electron-toolkit/preload'
import * as electron from 'electron'

const contextBridge =
  electron.contextBridge ?? (electron as unknown as { default?: typeof electron }).default?.contextBridge

type ContextBridgeLike = {
  exposeInMainWorld: (apiKey: string, api: unknown) => void
}

/** Exposes the Electron bridge APIs according to the renderer isolation mode. */
export function exposeElectronApi(
  bridge: ContextBridgeLike | undefined = contextBridge,
  api: unknown = electronAPI
): void {
  if (process.contextIsolated) {
    exposeIsolatedApi(bridge, api)
    return
  }

  exposeGlobalApi(api)
}

function exposeIsolatedApi(bridge: ContextBridgeLike | undefined, api: unknown): void {
  try {
    bridge?.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error)
  }
}

function exposeGlobalApi(api: unknown): void {
  // @ts-expect-error (define in dts)
  window.electron = api
}

exposeElectronApi()
