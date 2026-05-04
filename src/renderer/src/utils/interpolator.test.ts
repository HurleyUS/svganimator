import { describe, expect, test } from 'bun:test'
import type { Keyframe, SVGElementNode } from '../store/useStore'
import { applyAnimations } from './interpolator'

const element: SVGElementNode = {
  id: 'box',
  type: 'rect',
  name: 'Box',
  attributes: { id: 'box', opacity: '1', transform: 'translate(0 0) scale(1)' },
  children: [],
  isVisible: true,
  isLocked: false
}

describe('applyAnimations', () => {
  test('interpolates numeric attributes', () => {
    const keyframes: Keyframe[] = [
      { id: 'a', elementId: 'box', property: 'opacity', time: 0, value: 0, easing: 'linear' },
      { id: 'b', elementId: 'box', property: 'opacity', time: 1000, value: 1, easing: 'linear' }
    ]

    expect(applyAnimations([element], 500, keyframes)[0].attributes.opacity).toBe('0.5')
  })

  test('interpolates transform attributes', () => {
    const keyframes: Keyframe[] = [
      {
        id: 'a',
        elementId: 'box',
        property: 'transform',
        time: 0,
        value: 'translate(0 0) scale(1) rotate(0)',
        easing: 'linear'
      },
      {
        id: 'b',
        elementId: 'box',
        property: 'transform',
        time: 1000,
        value: 'translate(10 20) scale(3 5) rotate(90)',
        easing: 'linear'
      }
    ]

    expect(applyAnimations([element], 500, keyframes)[0].attributes.transform).toBe(
      'translate(5 10) scale(2 3) rotate(45)'
    )
  })
})
