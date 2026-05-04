import { beforeEach, describe, expect, mock, test } from 'bun:test'
import '../renderer/src/test/setup'

const exposedApis: string[] = []
const bridge = { exposeInMainWorld: (name: string) => exposedApis.push(name) }
const api = { ipcRenderer: {} }

mock.module('@electron-toolkit/preload', () => ({ electronAPI: api }))
mock.module('electron', () => ({ contextBridge: bridge }))
mock.module('electron/index.js', () => ({ contextBridge: bridge }))

describe('preload bootstrap', () => {
  beforeEach(() => {
    exposedApis.length = 0
  })

  test('exposes the electron api in isolated contexts', async () => {
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: true })
    const { exposeElectronApi } = await import('./index')

    exposeElectronApi(bridge, api)

    expect(exposedApis).toEqual(['electron', 'electron'])
  })

  test('falls back to a window global outside isolation', async () => {
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: false })
    const { exposeElectronApi } = await import('./index')

    exposeElectronApi(bridge, api)

    expect(window.electron).toEqual(api)
  })
})
