import React from 'react'
import { useStore, SVGElementNode } from '../store/useStore'
import { motion } from 'framer-motion'

export const TransformOverlay = () => {
  const { selectedElementIds, elements, updateElement, zoom, pan } = useStore()
  
  const findElement = (nodes: SVGElementNode[], id: string): SVGElementNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = findElement(node.children, id)
      if (found) return found
    }
    return undefined
  }

  const selectedElement = selectedElementIds.length > 0 
    ? findElement(elements, selectedElementIds[0]) 
    : undefined

  if (!selectedElement) return null

  const getBBox = (el: SVGElementNode) => {
    if (el.attributes['data-bbox-x'] && el.attributes['data-bbox-y']) {
      return {
        x: parseFloat(el.attributes['data-bbox-x']),
        y: parseFloat(el.attributes['data-bbox-y']),
        w: parseFloat(el.attributes['data-bbox-width'] || '100'),
        h: parseFloat(el.attributes['data-bbox-height'] || '100')
      }
    }

    const x = parseFloat(el.attributes.x || el.attributes.cx || '0')
    const y = parseFloat(el.attributes.y || el.attributes.cy || '0')
    const w = parseFloat(el.attributes.width || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '100'))
    const h = parseFloat(el.attributes.height || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '100'))
    return { x, y, w, h }
  }

  const bbox = getBBox(selectedElement)
  
  const handleDrag = (_: any, info: any) => {
    const dx = info.delta.x / zoom
    const dy = info.delta.y / zoom
    
    const updates: any = { attributes: { ...selectedElement.attributes } }
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

    if (selectedElement.attributes.x !== undefined) {
      updates.attributes.x = (parseFloat(selectedElement.attributes.x) + dx).toString()
    }
    if (selectedElement.attributes.y !== undefined) {
      updates.attributes.y = (parseFloat(selectedElement.attributes.y) + dy).toString()
    }
    if (selectedElement.attributes.cx !== undefined) {
      updates.attributes.cx = (parseFloat(selectedElement.attributes.cx) + dx).toString()
    }
    if (selectedElement.attributes.cy !== undefined) {
      updates.attributes.cy = (parseFloat(selectedElement.attributes.cy) + dy).toString()
    }
    
    updateElement(selectedElement.id, updates)
  }

  const handleResize = (corner: string, _: any, info: any) => {
    const dx = info.delta.x / zoom
    const dy = info.delta.y / zoom
    const updates: any = { attributes: { ...selectedElement.attributes } }

    if (updates.attributes['data-bbox-width'] !== undefined && updates.attributes['data-bbox-height'] !== undefined) {
      const bbox = getBBox(selectedElement)
      const nextWidth = Math.max(8, bbox.w + (corner.includes('e') ? dx : -dx))
      const nextHeight = Math.max(8, bbox.h + (corner.includes('s') ? dy : -dy))
      const scaleX = nextWidth / bbox.w
      const scaleY = nextHeight / bbox.h
      const nextX = corner.includes('w') ? bbox.x + (bbox.w - nextWidth) : bbox.x
      const nextY = corner.includes('n') ? bbox.y + (bbox.h - nextHeight) : bbox.y

      updates.attributes['data-bbox-x'] = nextX.toString()
      updates.attributes['data-bbox-y'] = nextY.toString()
      updates.attributes['data-bbox-width'] = nextWidth.toString()
      updates.attributes['data-bbox-height'] = nextHeight.toString()
      updates.attributes.transform = `translate(${nextX} ${nextY}) scale(${scaleX} ${scaleY}) translate(${-bbox.x} ${-bbox.y}) ${updates.attributes.transform || ''}`.trim()

      updateElement(selectedElement.id, updates)
      return
    }

    if (corner.includes('e')) {
      updates.attributes.width = (parseFloat(selectedElement.attributes.width || '0') + dx).toString()
    }
    if (corner.includes('s')) {
      updates.attributes.height = (parseFloat(selectedElement.attributes.height || '0') + dy).toString()
    }
    // Simplification for circle
    if (selectedElement.type === 'circle' && updates.attributes.width) {
       updates.attributes.r = (parseFloat(updates.attributes.width) / 2).toString()
    }

    updateElement(selectedElement.id, updates)
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
