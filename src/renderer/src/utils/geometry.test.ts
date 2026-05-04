import { describe, expect, test } from 'bun:test'
import type { SVGElementNode } from '../store/useStore'
import {
  createAnimationKeyframe,
  createAnimationKeyframeByName,
  getAnimatableProperties
} from './animationProperties'
import { getAggregateBounds, getElementBounds, moveElementAttributes } from './geometry'
import { collectElements, findElementById } from './svgTree'

const circle: SVGElementNode = {
  id: 'circle',
  type: 'circle',
  name: 'Circle',
  attributes: { cx: '10', cy: '20', r: '5' },
  children: [],
  isVisible: true,
  isLocked: false
}

describe('geometry helpers', () => {
  test('calculates shape and aggregate bounds', () => {
    expect(getElementBounds(circle)).toEqual({ x: 10, y: 20, w: 10, h: 10 })
    expect(getAggregateBounds([circle])).toEqual({ x: 10, y: 20, w: 10, h: 10 })
  })

  test('moves positional attributes', () => {
    expect(moveElementAttributes(circle, 2, 3)).toMatchObject({ cx: '12', cy: '23' })
  })
})

describe('SVG tree helpers', () => {
  test('finds and collects nested nodes', () => {
    const root: SVGElementNode = { ...circle, id: 'root', children: [circle] }

    expect(findElementById([root], 'circle')).toBe(circle)
    expect(collectElements([root], (node) => node.type === 'circle')).toEqual([root, circle])
  })
})

describe('animation property helpers', () => {
  test('creates keyframe payloads from selected element attributes', () => {
    const element: SVGElementNode = {
      ...circle,
      id: 'path',
      type: 'path',
      attributes: { d: 'M0 0L10 0', opacity: '0.4' }
    }
    const opacity = getAnimatableProperties(element).find((property) => property.property === 'opacity')

    expect(opacity).toBeDefined()
    if (!opacity) throw new Error('Expected opacity property')
    expect(createAnimationKeyframe(element, opacity, 250)).toEqual({
      elementId: 'path',
      property: 'opacity',
      time: 250,
      value: '0.4',
      easing: 'ease-in-out'
    })
    expect(
      createAnimationKeyframeByName(element, getAnimatableProperties(element), 'missing', 250)
    ).toBeUndefined()
  })
})
