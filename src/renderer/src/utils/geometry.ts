import type { SVGElementNode } from '../store/useStore'

/** Rectangle-like bounds used by editor layout and transform calculations. */
export interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

/** Calculates the editable bounds used by alignment, distribution, and transform handles. */
export function getElementBounds(element: SVGElementNode, fallbackSize = 0): Bounds {
  const importedBounds = getImportedBounds(element)
  if (importedBounds) return importedBounds

  const radius = parseFloat(element.attributes.r || '0')
  const width = parseFloat(element.attributes.width || (radius ? String(radius * 2) : String(fallbackSize)))
  const height = parseFloat(element.attributes.height || (radius ? String(radius * 2) : String(fallbackSize)))

  return {
    x: parseFloat(element.attributes.x || element.attributes.cx || '0'),
    y: parseFloat(element.attributes.y || element.attributes.cy || '0'),
    w: width,
    h: height
  }
}

function getImportedBounds(element: SVGElementNode): Bounds | undefined {
  const x = element.attributes['data-bbox-x']
  const y = element.attributes['data-bbox-y']
  if (x === undefined || y === undefined) return undefined

  return {
    x: parseFloat(x),
    y: parseFloat(y),
    w: parseFloat(element.attributes['data-bbox-width'] || '100'),
    h: parseFloat(element.attributes['data-bbox-height'] || '100')
  }
}

/** Returns aggregate bounds enclosing every provided element. */
export function getAggregateBounds(elements: SVGElementNode[]): Bounds {
  const bounds = elements.map((element) => getElementBounds(element))
  const minX = Math.min(...bounds.map((bound) => bound.x))
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.w))
  const minY = Math.min(...bounds.map((bound) => bound.y))
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.h))

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/** Applies x/y movement to common SVG positional attributes. */
export function moveElementAttributes(
  element: SVGElementNode,
  dx: number,
  dy: number
): Record<string, string> {
  const attributes = { ...element.attributes }

  moveAttribute(attributes, 'x', dx)
  moveAttribute(attributes, 'y', dy)
  moveAttribute(attributes, 'cx', dx)
  moveAttribute(attributes, 'cy', dy)

  return attributes
}

function moveAttribute(attributes: Record<string, string>, name: string, delta: number) {
  if (attributes[name] === undefined) return
  attributes[name] = (parseFloat(attributes[name]) + delta).toString()
}
