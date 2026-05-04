import { motion } from 'framer-motion'
import { type SVGElementNode, useStore } from '../store/useStore'
import { getElementBounds, moveElementAttributes } from '../utils/geometry'
import { findElementById } from '../utils/svgTree'

type DragInfo = { delta: { x: number; y: number } }

const MIN_IMPORTED_SIZE = 8

function hasImportedBounds(attributes: SVGElementNode['attributes']) {
  return attributes['data-bbox-width'] !== undefined && attributes['data-bbox-height'] !== undefined
}

function getResizedImportedAttributes(
  element: SVGElementNode,
  corner: string,
  dx: number,
  dy: number
): SVGElementNode['attributes'] {
  const bbox = getElementBounds(element, 100)
  const nextWidth = Math.max(MIN_IMPORTED_SIZE, bbox.w + (corner.includes('e') ? dx : -dx))
  const nextHeight = Math.max(MIN_IMPORTED_SIZE, bbox.h + (corner.includes('s') ? dy : -dy))
  const nextX = corner.includes('w') ? bbox.x + (bbox.w - nextWidth) : bbox.x
  const nextY = corner.includes('n') ? bbox.y + (bbox.h - nextHeight) : bbox.y

  return {
    ...element.attributes,
    'data-bbox-x': nextX.toString(),
    'data-bbox-y': nextY.toString(),
    'data-bbox-width': nextWidth.toString(),
    'data-bbox-height': nextHeight.toString(),
    transform:
      `translate(${nextX} ${nextY}) scale(${nextWidth / bbox.w} ${nextHeight / bbox.h}) translate(${-bbox.x} ${-bbox.y}) ${element.attributes.transform || ''}`.trim()
  }
}

function getResizedPrimitiveAttributes(
  element: SVGElementNode,
  corner: string,
  dx: number,
  dy: number
): SVGElementNode['attributes'] {
  const attributes = { ...element.attributes }
  if (corner.includes('e')) attributes.width = (parseFloat(element.attributes.width || '0') + dx).toString()
  if (corner.includes('s')) attributes.height = (parseFloat(element.attributes.height || '0') + dy).toString()
  if (element.type === 'circle' && attributes.width)
    attributes.r = (parseFloat(attributes.width) / 2).toString()
  return attributes
}

/** Draws draggable resize handles for the currently selected SVG element. */
export const TransformOverlay = () => {
  const { selectedElementIds, elements, updateElement, zoom, pan } = useStore()

  const selectedElement =
    selectedElementIds.length > 0 ? findElementById(elements, selectedElementIds[0]) : undefined

  if (!selectedElement) return null

  const bbox = getElementBounds(selectedElement, 100)

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
    const dx = info.delta.x / zoom
    const dy = info.delta.y / zoom

    const updates: Partial<SVGElementNode> = { attributes: { ...selectedElement.attributes } }
    if (!updates.attributes) return

    if (updates.attributes['data-bbox-x'] !== undefined && updates.attributes['data-bbox-y'] !== undefined) {
      const nextX = parseFloat(updates.attributes['data-bbox-x']) + dx
      const nextY = parseFloat(updates.attributes['data-bbox-y']) + dy
      const prevX = parseFloat(updates.attributes['data-bbox-x'])
      const prevY = parseFloat(updates.attributes['data-bbox-y'])

      updates.attributes['data-bbox-x'] = nextX.toString()
      updates.attributes['data-bbox-y'] = nextY.toString()
      updates.attributes.transform = `translate(${dx} ${dy}) ${updates.attributes.transform || ''}`.trim()

      if (!updates.attributes.transform) {
        updates.attributes.transform = `translate(${nextX - prevX} ${nextY - prevY})`
      }

      updateElement(selectedElement.id, updates)
      return
    }

    updateElement(selectedElement.id, { attributes: moveElementAttributes(selectedElement, dx, dy) })
  }

  const handleResize = (corner: string, _: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
    const dx = info.delta.x / zoom
    const dy = info.delta.y / zoom
    const attributes = hasImportedBounds(selectedElement.attributes)
      ? getResizedImportedAttributes(selectedElement, corner, dx, dy)
      : getResizedPrimitiveAttributes(selectedElement, corner, dx, dy)

    updateElement(selectedElement.id, { attributes })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <motion.div
        drag
        dragMomentum={false}
        onDrag={handleDrag}
        style={{
          position: 'absolute',
          left: bbox.x * zoom + pan.x,
          top: bbox.y * zoom + pan.y,
          width: bbox.w * zoom,
          height: bbox.h * zoom,
          border: '1px solid #007acc',
          pointerEvents: 'auto',
          cursor: 'move',
          boxSizing: 'border-box'
        }}
      >
        {/* Resize Handles */}
        {[
          { id: 'nw', cursor: 'nw-resize', left: -4, top: -4 },
          { id: 'ne', cursor: 'ne-resize', right: -4, top: -4 },
          { id: 'sw', cursor: 'sw-resize', left: -4, bottom: -4 },
          { id: 'se', cursor: 'se-resize', right: -4, bottom: -4 }
        ].map((h) => (
          <motion.div
            key={h.id}
            drag
            dragMomentum={false}
            onDrag={(e, info) => handleResize(h.id, e, info)}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              background: '#fff',
              border: '1px solid #007acc',
              pointerEvents: 'auto',
              cursor: h.cursor,
              left: h.left,
              top: h.top,
              right: h.right,
              bottom: h.bottom
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
