import { describe, expect, test } from 'bun:test'
import type { Keyframe, SVGElementNode } from '../store/useStore'
import { exportToSVG } from './exporter'

describe('exportToSVG', () => {
  test('serializes visible elements and keyframe styles', () => {
    const elements: SVGElementNode[] = [
      {
        id: 'box',
        type: 'rect',
        name: 'Box',
        attributes: { id: 'box', width: '10', height: '20' },
        children: [],
        isVisible: true,
        isLocked: false
      }
    ]
    const keyframes: Keyframe[] = [
      { id: 'fade', elementId: 'box', property: 'opacity', time: 500, value: 0.5, easing: 'linear' }
    ]

    const svg = exportToSVG(elements, keyframes, 1000)

    expect(svg).toContain('<rect id="box" width="10" height="20"></rect>')
    expect(svg).toContain('@keyframes anim_box_opacity')
    expect(svg).toContain('50.00% { opacity: 0.5; }')
  })
})
