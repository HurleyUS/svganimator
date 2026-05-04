import './test/setup'
import { describe, expect, test } from 'bun:test'
import { cleanup, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { mountApp as mountAppType } from './main'

describe('renderer bootstrap', () => {
  test('mounts the app into the root element', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    let mountApp: typeof mountAppType | undefined
    await act(async () => {
      mountApp = (await import('./main')).mountApp
    })

    await waitFor(() => expect(document.body.textContent).toContain('Login'))
    const secondaryRoot = document.createElement('div')
    document.body.append(secondaryRoot)
    await act(async () => {
      mountApp?.(secondaryRoot)
    })
    await waitFor(() => expect(secondaryRoot.textContent).toContain('Login'))
    cleanup()
  })
})
