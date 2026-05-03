import { Keyframe, SVGElementNode } from '../store/useStore'
import { interpolate } from 'flubber'

export function getInterpolatedValue(
  elementId: string,
  property: string,
  time: number,
  keyframes: Keyframe[],
  defaultValue: string | number
): string | number {
  const propKeyframes = keyframes
    .filter((k) => k.elementId === elementId && k.property === property)
    .sort((a, b) => a.time - b.time)

  if (propKeyframes.length === 0) return defaultValue
  if (time <= propKeyframes[0].time) return propKeyframes[0].value
  if (time >= propKeyframes[propKeyframes.length - 1].time)
    return propKeyframes[propKeyframes.length - 1].value

  const nextIndex = propKeyframes.findIndex((k) => k.time > time)
  const prev = propKeyframes[nextIndex - 1]
  const next = propKeyframes[nextIndex]

  const t = (time - prev.time) / (next.time - prev.time)

  // Basic interpolation
  if (typeof prev.value === 'number' && typeof next.value === 'number') {
    return prev.value + (next.value - prev.value) * t
  }

  const prevNumber = typeof prev.value === 'string' ? parseFloat(prev.value) : NaN
  const nextNumber = typeof next.value === 'string' ? parseFloat(next.value) : NaN
  if (Number.isFinite(prevNumber) && Number.isFinite(nextNumber)) {
    return prevNumber + (nextNumber - prevNumber) * t
  }

  if (property === 'transform') {
    return interpolateTransform(String(prev.value), String(next.value), t)
  }

  if (property === 'd' || property === 'path') {
    try {
      const interpolator = interpolate(prev.value as string, next.value as string)
      return interpolator(t)
    } catch (e) {
      return prev.value
    }
  }

  // Fallback for strings (no interpolation)
  return t < 0.5 ? prev.value : next.value
}

function readTransform(transform: string) {
  const result = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 }
  const translateMatches = transform.matchAll(/translate\(([-\d.]+)(?:[\s,]+([-\d.]+))?\)/g)
  const scaleMatches = transform.matchAll(/scale\(([-\d.]+)(?:[\s,]+([-\d.]+))?\)/g)
  const rotateMatches = transform.matchAll(/rotate\(([-\d.]+)/g)

  for (const match of translateMatches) {
    result.x += parseFloat(match[1]) || 0
    result.y += parseFloat(match[2] || '0') || 0
  }

  for (const match of scaleMatches) {
    const scaleX = parseFloat(match[1]) || 1
    const scaleY = parseFloat(match[2] || match[1]) || scaleX
    result.scaleX *= scaleX
    result.scaleY *= scaleY
  }

  for (const match of rotateMatches) {
    result.rotate += parseFloat(match[1]) || 0
  }

  return result
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

export function applyAnimations(
  elements: SVGElementNode[],
  time: number,
  keyframes: Keyframe[]
): SVGElementNode[] {
  return elements.map((node) => {
    const animatedAttributes = { ...node.attributes }
    
    // Find all properties animated for this element
    const properties = Array.from(new Set(keyframes
      .filter(k => k.elementId === node.id)
      .map(k => k.property)))

    properties.forEach(prop => {
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
