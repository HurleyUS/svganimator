import { describe, expect, mock, test } from 'bun:test'

const appHandlers = new Map<string, (...args: unknown[]) => void>()
const windowHandlers: string[] = []
const loadedUrls: string[] = []
const loadedFiles: string[] = []
let userModelId = ''
let shortcutsWatched = false
let quitCalled = false

class MockBrowserWindow {
  webContents = {
    session: {
      webRequest: {
        onHeadersReceived: (_handler: unknown) => {}
      }
    },
    on: (event: string) => windowHandlers.push(event),
    setWindowOpenHandler: (_handler: unknown) => {}
  }

  on(event: string): void {
    windowHandlers.push(event)
  }

  loadURL(url: string): void {
    loadedUrls.push(url)
  }

  loadFile(file: string): void {
    loadedFiles.push(file)
  }

  show(): void {}

  static getAllWindows(): unknown[] {
    return []
  }
}

mock.module('@electron-toolkit/utils', () => ({
  electronApp: {
    setAppUserModelId: (id: string) => {
      userModelId = id
    }
  },
  is: { dev: false },
  optimizer: {
    watchWindowShortcuts: () => {
      shortcutsWatched = true
    }
  }
}))

mock.module('electron', () => ({
  app: {
    on: (event: string, handler: (...args: unknown[]) => void) => {
      appHandlers.set(event, handler)
    },
    quit: () => {
      quitCalled = true
    },
    whenReady: () => Promise.resolve()
  },
  BrowserWindow: MockBrowserWindow,
  contextBridge: {
    exposeInMainWorld: (_apiKey: string, _api: unknown) => {}
  },
  shell: { openExternal: (_url: string) => {} }
}))

describe('main process bootstrap', () => {
  test('registers lifecycle handlers and creates the initial window', async () => {
    const { bootstrapElectronApp, createWindow } = await import('./index')
    await Promise.resolve()
    bootstrapElectronApp()
    createWindow()
    await Promise.resolve()

    expect(userModelId).toBe('com.electron.svganimator')
    expect(windowHandlers).toContain('ready-to-show')
    expect(loadedFiles[0]).toContain('renderer/index.html')

    appHandlers.get('browser-window-created')?.({}, {})
    appHandlers.get('window-all-closed')?.()

    expect(shortcutsWatched).toBe(true)
    expect(quitCalled).toBe(process.platform !== 'darwin')
  })
})
