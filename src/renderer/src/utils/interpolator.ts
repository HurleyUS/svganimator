import { interpolate } from 'flubber'
import type { Keyframe, SVGElementNode } from '../store/useStore'

function getPropertyKeyframes(elementId: string, property: string, keyframes: Keyframe[]): Keyframe[] {
  return keyframes
    .filter((k) => k.elementId === elementId && k.property === property)
    .sort((a, b) => a.time - b.time)
}

function getBoundaryValue(time: number, propKeyframes: Keyframe[], defaultValue: string | number) {
  if (propKeyframes.length === 0) return defaultValue
  if (time <= propKeyframes[0].time) return propKeyframes[0].value
  const last = propKeyframes[propKeyframes.length - 1]
  if (time >= last.time) return last.value
  return undefined
}

function interpolatePath(from: string | number, to: string | number, t: number) {
  try {
    return interpolate(from as string, to as string)(t)
  } catch {
    return from
  }
}

function interpolateKeyframeValues(property: string, prev: Keyframe, next: Keyframe, t: number) {
  return (
    interpolateNumbers(prev.value, next.value, t) ??
    interpolateSpecialProperty(property, prev.value, next.value, t) ??
    (t < 0.5 ? prev.value : next.value)
  )
}

function interpolateNumbers(from: string | number, to: string | number, t: number) {
  if (typeof from === 'number' && typeof to === 'number') return lerp(from, to, t)

  const prevNumber = typeof from === 'string' ? parseFloat(from) : NaN
  const nextNumber = typeof to === 'string' ? parseFloat(to) : NaN
  return Number.isFinite(prevNumber) && Number.isFinite(nextNumber)
    ? lerp(prevNumber, nextNumber, t)
    : undefined
}

function interpolateSpecialProperty(property: string, from: string | number, to: string | number, t: number) {
  if (property === 'transform') return interpolateTransform(String(from), String(to), t)
  if (property === 'd' || property === 'path') return interpolatePath(from, to, t)
  return undefined
}

function getInterpolatedValue(
  elementId: string,
  property: string,
  time: number,
  keyframes: Keyframe[],
  defaultValue: string | number
): string | number {
  const propKeyframes = getPropertyKeyframes(elementId, property, keyframes)
  const boundaryValue = getBoundaryValue(time, propKeyframes, defaultValue)
  if (boundaryValue !== undefined) return boundaryValue
  const nextIndex = propKeyframes.findIndex((k) => k.time > time)
  const prev = propKeyframes[nextIndex - 1]
  const next = propKeyframes[nextIndex]
  const t = (time - prev.time) / (next.time - prev.time)
  return interpolateKeyframeValues(property, prev, next, t)
}

function readTransform(transform: string) {
  return {
    ...readTranslate(transform),
    ...readScale(transform),
    rotate: sumMatches(transform, /rotate\(([-\d.]+)/g)
  }
}

function readTranslate(transform: string) {
  let x = 0
  let y = 0
  for (const match of transform.matchAll(/translate\(([-\d.]+)(?:[\s,]+([-\d.]+))?\)/g)) {
    x += parseFloat(match[1]) || 0
    y += parseFloat(match[2] || '0') || 0
  }
  return { x, y }
}

function readScale(transform: string) {
  let scaleX = 1
  let scaleY = 1
  for (const match of transform.matchAll(/scale\(([-\d.]+)(?:[\s,]+([-\d.]+))?\)/g)) {
    const nextScaleX = parseFloat(match[1]) || 1
    const nextScaleY = parseFloat(match[2] || match[1]) || nextScaleX
    scaleX *= nextScaleX
    scaleY *= nextScaleY
  }
  return { scaleX, scaleY }
}

function sumMatches(value: string, matcher: RegExp) {
  let total = 0
  for (const match of value.matchAll(matcher)) {
    total += parseFloat(match[1]) || 0
  }
  return total
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t
}

function interpolateTransform(from: string, to: string, t: number) {
  const prev = readTransform(from)
  const next = readTransform(to)

  return [
    `translate(${lerp(prev.x, next.x, t)} ${lerp(prev.y, next.y, t)})`,
    `scale(${lerp(prev.scaleX, next.scaleX, t)} ${lerp(prev.scaleY, next.scaleY, t)})`,
    `rotate(${lerp(prev.rotate, next.rotate, t)})`
  ].join(' ')
}

/** Applies timeline keyframes to an SVG element tree for the requested playback time. */
export function applyAnimations(
  elements: SVGElementNode[],
  time: number,
  keyframes: Keyframe[]
): SVGElementNode[] {
  return elements.map((node) => {
    const animatedAttributes = { ...node.attributes }

    // Find all properties animated for this element
    const properties = Array.from(
      new Set(keyframes.filter((k) => k.elementId === node.id).map((k) => k.property))
    )

    properties.forEach((prop) => {
      animatedAttributes[prop] = getInterpolatedValue(
        node.id,
        prop,
        time,
        keyframes,
        node.attributes[prop] || (prop === 'opacity' ? 1 : '')
      ).toString()
    })

    return {
      ...node,
      attributes: animatedAttributes,
      children: applyAnimations(node.children, time, keyframes)
    }
  })
}
