import type { Keyframe, SVGElementNode } from '../store/useStore'

/** Describes one SVG property that can be added as a timeline animation track. */
export interface AnimatableProperty {
  property: string
  label: string
  group: 'Transform' | 'Appearance' | 'Stroke' | 'Path' | 'Filter'
  shortcut: string
  fallback: string | number
}

const commonProperties: AnimatableProperty[] = [
  { property: 'transform', label: 'Position', group: 'Transform', shortcut: 'P', fallback: 'translate(0 0)' },
  { property: 'transform-origin', label: 'Origin', group: 'Transform', shortcut: 'A', fallback: '0 0' },
  { property: 'scale', label: 'Scale', group: 'Transform', shortcut: 'S', fallback: '1' },
  { property: 'rotate', label: 'Rotate', group: 'Transform', shortcut: 'R', fallback: '0deg' },
  { property: 'skew', label: 'Skew', group: 'Transform', shortcut: 'K', fallback: '0deg' },
  { property: 'opacity', label: 'Opacity', group: 'Appearance', shortcut: 'O', fallback: 1 },
  { property: 'fill', label: 'Fill color', group: 'Appearance', shortcut: 'C', fallback: '#ffffff' },
  { property: 'fill-opacity', label: 'Fill opacity', group: 'Appearance', shortcut: 'F', fallback: 1 },
  { property: 'stroke', label: 'Stroke color', group: 'Stroke', shortcut: 'B', fallback: '#000000' },
  { property: 'stroke-opacity', label: 'Stroke opacity', group: 'Stroke', shortcut: 'T', fallback: 1 },
  { property: 'stroke-width', label: 'Stroke width', group: 'Stroke', shortcut: 'W', fallback: 1 },
  { property: 'stroke-dasharray', label: 'Stroke dashes', group: 'Stroke', shortcut: 'D', fallback: '' },
  { property: 'filter', label: 'Filters', group: 'Filter', shortcut: 'L', fallback: 'none' }
]

const pathProperties: AnimatableProperty[] = [
  { property: 'd', label: 'Morph', group: 'Path', shortcut: 'M', fallback: '' }
]

/** Returns the full keyframeable property list for the selected SVG element. */
export function getAnimatableProperties(element?: SVGElementNode): AnimatableProperty[] {
  if (!element) return commonProperties
  return element.type === 'path' || element.attributes.d
    ? [...pathProperties, ...commonProperties]
    : commonProperties
}

/** Resolves the current keyframe value for a property on an SVG element. */
export function getAnimatableValue(element: SVGElementNode, property: AnimatableProperty): string | number {
  return element.attributes[property.property] ?? property.fallback
}

/** Builds a store-ready keyframe payload for the selected SVG element and property. */
export function createAnimationKeyframe(
  element: SVGElementNode,
  property: AnimatableProperty,
  time: number,
  easing = 'ease-in-out'
): Omit<Keyframe, 'id'> {
  return {
    elementId: element.id,
    property: property.property,
    time,
    value: getAnimatableValue(element, property),
    easing
  }
}

/** Builds a keyframe payload by looking up an animatable property name in a catalog. */
export function createAnimationKeyframeByName(
  element: SVGElementNode,
  properties: AnimatableProperty[],
  propertyName: string,
  time: number,
  easing = 'ease-in-out'
): Omit<Keyframe, 'id'> | undefined {
  const property = properties.find((item) => item.property === propertyName)
  return property ? createAnimationKeyframe(element, property, time, easing) : undefined
}
