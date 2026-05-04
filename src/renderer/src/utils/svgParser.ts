import { nanoid } from 'nanoid'
import type { SVGElementNode } from '../store/useStore'

/** Parses an uploaded SVG string into editor elements fitted to the default artboard. */
export function parseSVG(svgString: string): SVGElementNode[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgRoot = doc.querySelector('svg')

  if (!svgRoot) return []

  const viewBox = svgRoot.getAttribute('viewBox')
  const viewBoxParts = viewBox
    ?.split(/[\s,]+/)
    .map(Number)
    .filter((value) => Number.isFinite(value))
  const sourceBounds =
    viewBoxParts?.length === 4
      ? { x: viewBoxParts[0], y: viewBoxParts[1], width: viewBoxParts[2], height: viewBoxParts[3] }
      : {
          x: 0,
          y: 0,
          width: parseFloat(svgRoot.getAttribute('width') || '600') || 600,
          height: parseFloat(svgRoot.getAttribute('height') || '400') || 400
        }

  const artboard = { x: 318, y: 58, width: 364, height: 564 }
  const scale = Math.min(artboard.width / sourceBounds.width, artboard.height / sourceBounds.height)
  const width = sourceBounds.width * scale
  const height = sourceBounds.height * scale
  const x = artboard.x + (artboard.width - width) / 2
  const y = artboard.y + (artboard.height - height) / 2

  const parseNode = (node: Element): SVGElementNode | null => {
    const allowedTypes = [
      'path',
      'rect',
      'circle',
      'ellipse',
      'line',
      'polyline',
      'polygon',
      'g',
      'text',
      'image',
      'use',
      'defs',
      'clipPath',
      'mask',
      'linearGradient',
      'radialGradient',
      'stop',
      'filter',
      'feGaussianBlur',
      'feOffset',
      'feMerge',
      'feMergeNode',
      'feColorMatrix',
      'feComposite',
      'feFlood',
      'feMorphology',
      'feBlend',
      'feTurbulence',
      'feDisplacementMap',
      'feSpecularLighting',
      'feDiffuseLighting',
      'fePointLight',
      'feDistantLight',
      'feSpotLight'
    ]

    const type = node.tagName.toLowerCase()
    if (!allowedTypes.includes(type) && type !== 'svg') return null

    const attributes: Record<string, string> = {}
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i]
      attributes[attr.name] = attr.value
    }

    const children: SVGElementNode[] = []
    for (let i = 0; i < node.children.length; i++) {
      const child = parseNode(node.children[i])
      if (child) children.push(child)
    }

    return {
      id: attributes.id || nanoid(),
      type,
      name: attributes.id || `${type}_${nanoid(4)}`,
      attributes,
      children,
      isVisible: true,
      isLocked: false
    }
  }

  const defs: SVGElementNode[] = []
  const content: SVGElementNode[] = []

  for (let i = 0; i < svgRoot.children.length; i++) {
    const child = parseNode(svgRoot.children[i])
    if (!child) continue
    if (
      child.type === 'defs' ||
      child.type === 'clipPath' ||
      child.type === 'mask' ||
      child.type.includes('gradient') ||
      child.type === 'filter'
    ) {
      defs.push(child)
    } else {
      content.push(child)
    }
  }

  const importId = svgRoot.getAttribute('id') || `import_${nanoid(4)}`
  const importedGroup: SVGElementNode = {
    id: importId,
    type: 'g',
    name: svgRoot.getAttribute('aria-label') || svgRoot.getAttribute('id') || 'Imported SVG',
    attributes: {
      id: importId,
      transform: `translate(${x} ${y}) scale(${scale}) translate(${-sourceBounds.x} ${-sourceBounds.y})`,
      'data-bbox-x': x.toString(),
      'data-bbox-y': y.toString(),
      'data-bbox-width': width.toString(),
      'data-bbox-height': height.toString()
    },
    children: content,
    isVisible: true,
    isLocked: false
  }

  return [...defs, importedGroup]
}
