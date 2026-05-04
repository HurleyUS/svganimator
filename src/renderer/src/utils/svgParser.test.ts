import '../test/setup'
import { describe, expect, test } from 'bun:test'
import { parseSVG } from './svgParser'

describe('parseSVG', () => {
  test('fits imported artwork into the app artboard and preserves defs', () => {
    const nodes = parseSVG(`
      <svg id="sample" viewBox="0 0 200 100" aria-label="Sample">
        <defs><clipPath id="clip"><rect width="10" height="10" /></clipPath></defs>
        <rect id="body" width="200" height="100" />
      </svg>
    `)

    expect(nodes).toHaveLength(2)
    expect(nodes[0].type).toBe('defs')
    expect(nodes[1].id).toBe('sample')
    expect(nodes[1].name).toBe('Sample')
    expect(Number(nodes[1].attributes['data-bbox-width'])).toBeCloseTo(364)
    expect(nodes[1].children[0].id).toBe('body')
  })

  test('ignores unsupported elements', () => {
    const nodes = parseSVG('<svg><script id="bad"></script><circle id="ok" r="10" /></svg>')

    expect(nodes.at(-1)?.children.map((child) => child.id)).toEqual(['ok'])
  })
})
