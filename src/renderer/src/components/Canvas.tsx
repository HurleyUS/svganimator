import React from 'react'
import { useStore, SVGElementNode } from '../store/useStore'
import { applyAnimations } from '../utils/interpolator'
import { TransformOverlay } from './TransformOverlay'

const toReactStyle = (style: string): React.CSSProperties => {
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce<React.CSSProperties>((styles, declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex === -1) return styles

      const rawProperty = declaration.slice(0, separatorIndex).trim()
      const value = declaration.slice(separatorIndex + 1).trim()
      const property = rawProperty.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())

      return { ...styles, [property]: value }
    }, {})
}

const svgAttributeAliases: Record<string, string> = {
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'color-rendering': 'colorRendering',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'paint-order': 'paintOrder',
  'pointer-events': 'pointerEvents',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'unicode-bidi': 'unicodeBidi',
  'vector-effect': 'vectorEffect',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'xlink:href': 'href',
  'xml:space': 'xmlSpace'
}

const toReactSVGProps = (attributes: SVGElementNode['attributes']) => {
  const props: Record<string, unknown> = {}

  Object.entries(attributes).forEach(([attribute, value]) => {
    props[svgAttributeAliases[attribute] || attribute] = value
  })

  if (typeof props.style === 'string') {
    props.style = toReactStyle(props.style)
  }

  if (typeof props.class === 'string') {
    props.className = props.class
    delete props.class
  }

  return props
}

const SVGNode = ({ node, onSelect }: { node: SVGElementNode; onSelect: (id: string) => void }) => {
  if (!node.isVisible) return null
  
  const Component = node.type as any
  const { children, attributes, id } = node
  const reactProps = toReactSVGProps(attributes)

  return (
    <Component
      {...reactProps}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect(id)
      }}
    >
      {children.map((child) => (
        <SVGNode key={child.id} node={child} onSelect={onSelect} />
      ))}
    </Component>
  )
}

export const Canvas = () => {
  const { elements, keyframes, currentTime, setSelectedElements, zoom, setZoom, pan, setPan } = useStore()
  const [isPanning, setIsPanning] = React.useState(false)
  const lastMousePos = React.useRef({ x: 0, y: 0 })

  const animatedElements = React.useMemo(() => {
    return applyAnimations(elements, currentTime, keyframes)
  }, [elements, currentTime, keyframes])

  const handleSelect = (id: string) => {
    setSelectedElements([id])
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(Math.min(Math.max(zoom * delta, 0.1), 20))
    } else {
      setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  return (
    <div 
      className="canvas-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'default'
      }} 
      onClick={() => setSelectedElements([])}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', background: '#8b8b8b' }}
      >
        <defs>
          <pattern id="canvas-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#7d7d7d" strokeWidth="1" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="1000" height="1000" fill="url(#canvas-grid)" />
        <rect x="318" y="58" width="364" height="564" rx="4" fill="#ffffff" stroke="#ffc15a" strokeWidth="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,.22))" />
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {animatedElements.map((el) => (
            <SVGNode key={el.id} node={el} onSelect={handleSelect} />
          ))}
        </g>
      </svg>
      <TransformOverlay />
    </div>
  )
}
