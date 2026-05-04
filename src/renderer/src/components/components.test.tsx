import '../test/setup'
import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import App from '../App'
import { useStore } from '../store/useStore'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { Sidebar } from './Sidebar'
import { Timeline } from './Timeline'
import { Toolbar } from './Toolbar'
import { TransformOverlay } from './TransformOverlay'

afterEach(() => {
  cleanup()
  useStore.setState({
    elements: [],
    keyframes: [],
    selectedElementIds: [],
    selectedKeyframeId: null,
    currentTime: 0,
    duration: 5000,
    isLooping: false,
    loopRange: [0, 5000],
    zoom: 1,
    timelineZoom: 1,
    pan: { x: 0, y: 0 }
  })
})

describe('editor components', () => {
  test('renders the login shell', () => {
    render(<App />)
    expect(document.body.textContent).toContain('SVG Animator Login')
  })

  test('renders primary editor panels without selected content', () => {
    render(<Toolbar />)
    render(<Sidebar />)
    render(<Canvas />)
    render(<PropertiesPanel />)
    render(<Timeline />)
    render(<TransformOverlay />)

    expect(document.body.textContent).toContain('Untitled')
    expect(document.body.textContent).toContain('Layers')
    expect(document.body.textContent).toContain('Select an element')
  })
})
