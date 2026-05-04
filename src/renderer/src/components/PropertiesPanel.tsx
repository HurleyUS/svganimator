import type { Keyframe, SVGElementNode } from '../store/useStore'
import { useStore } from '../store/useStore'
import { getAnimatableProperties } from '../utils/animationProperties'
import { findElementById } from '../utils/svgTree'
import { AnimateMenu } from './AnimateMenu'

type AttributeChange = (name: string, value: string) => void
type DualAttribute = {
  left: string
  right: string
  leftValue: string
  rightValue: string
}

function KeyframeInspector({
  keyframe,
  onUpdate
}: {
  keyframe: Keyframe
  onUpdate: (id: string, updates: Partial<Keyframe>) => void
}) {
  return (
    <div className="property-section">
      <div className="sidebar-header">Keyframe: {keyframe.property}</div>
      <div className="properties-list">
        <div className="property-group">
          <label>Value</label>
          <input
            type="text"
            value={keyframe.value}
            onChange={(event) => onUpdate(keyframe.id, { value: event.target.value })}
          />
        </div>
        <div className="property-group">
          <label>Easing</label>
          <select
            value={keyframe.easing}
            onChange={(event) => onUpdate(keyframe.id, { easing: event.target.value })}
          >
            <option value="linear">Linear</option>
            <option value="ease-in">Ease In</option>
            <option value="ease-out">Ease Out</option>
            <option value="ease-in-out">Ease In Out</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function PathInspector({ element, onChange }: { element: SVGElementNode; onChange: AttributeChange }) {
  const position = getPositionAttributes(element)
  const size = getSizeAttributes(element)

  return (
    <section className="inspector-section">
      <header className="inspector-section-title">Path</header>
      <DualAttributeRow label="Position" attributes={position} onChange={onChange} />
      <DualAttributeRow label="Size" attributes={size} onChange={onChange} />
      <AnimateMenu align="right" />
      <button className="add-prop-button">Set motion path</button>
    </section>
  )
}

function getPositionAttributes(element: SVGElementNode): DualAttribute {
  return {
    left: element.attributes.cx ? 'cx' : 'x',
    right: element.attributes.cy ? 'cy' : 'y',
    leftValue: element.attributes.x ?? element.attributes.cx ?? '0',
    rightValue: element.attributes.y ?? element.attributes.cy ?? '0'
  }
}

function getSizeAttributes(element: SVGElementNode): DualAttribute {
  return {
    left: element.attributes.r ? 'r' : 'width',
    right: element.attributes.r ? 'r' : 'height',
    leftValue: element.attributes.width ?? element.attributes.r ?? '0',
    rightValue: element.attributes.height ?? element.attributes.r ?? '0'
  }
}

function DualAttributeRow({
  label,
  attributes,
  onChange
}: {
  label: string
  attributes: DualAttribute
  onChange: AttributeChange
}) {
  return (
    <div className="inspector-row">
      <label>{label}</label>
      <input
        value={attributes.leftValue}
        onChange={(event) => onChange(attributes.left, event.target.value)}
      />
      <input
        value={attributes.rightValue}
        onChange={(event) => onChange(attributes.right, event.target.value)}
      />
    </div>
  )
}

function TransformInspector({ element, onChange }: { element: SVGElementNode; onChange: AttributeChange }) {
  return (
    <section className="inspector-section">
      <header className="inspector-section-title">Transforms</header>
      <div className="inspector-row">
        <label>Position</label>
        <input
          value={element.attributes.transform || 'translate(0 0)'}
          onChange={(event) => onChange('transform', event.target.value)}
        />
      </div>
      <div className="inspector-row">
        <label>Scale</label>
        <input
          value={element.attributes.scale || '1'}
          onChange={(event) => onChange('scale', event.target.value)}
        />
        <input
          value={element.attributes.rotate || '0'}
          onChange={(event) => onChange('rotate', event.target.value)}
        />
      </div>
    </section>
  )
}

function AppearanceInspector({ element, onChange }: { element: SVGElementNode; onChange: AttributeChange }) {
  return (
    <section className="inspector-section">
      <header className="inspector-section-title">Appearance</header>
      <div className="inspector-row">
        <label>Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.attributes.opacity || '1'}
          onChange={(event) => onChange('opacity', event.target.value)}
        />
        <input
          value={element.attributes.opacity || '1'}
          onChange={(event) => onChange('opacity', event.target.value)}
        />
      </div>
      <div className="inspector-row">
        <label>Fill</label>
        <input
          type="color"
          value={element.attributes.fill || '#ffffff'}
          onChange={(event) => onChange('fill', event.target.value)}
        />
        <input
          value={element.attributes.fill || '#ffffff'}
          onChange={(event) => onChange('fill', event.target.value)}
        />
      </div>
      <div className="inspector-row">
        <label>Stroke</label>
        <input
          type="color"
          value={element.attributes.stroke || '#000000'}
          onChange={(event) => onChange('stroke', event.target.value)}
        />
        <input
          value={element.attributes['stroke-width'] || '1'}
          onChange={(event) => onChange('stroke-width', event.target.value)}
        />
      </div>
    </section>
  )
}

function AnimationInspector({ element }: { element: SVGElementNode }) {
  return (
    <section className="inspector-section">
      <header className="inspector-section-title">Animations</header>
      <div className="animation-chip-grid">
        {getAnimatableProperties(element).map((property) => (
          <span key={property.property}>{property.label}</span>
        ))}
      </div>
    </section>
  )
}

function AttributeInspector({ element, onChange }: { element: SVGElementNode; onChange: AttributeChange }) {
  return (
    <>
      <div className="property-group">
        <label>ID</label>
        <input
          type="text"
          value={element.attributes.id || ''}
          onChange={(event) => onChange('id', event.target.value)}
        />
      </div>
      {Object.entries(element.attributes).map(([key, value]) => (
        <AttributeRow key={key} name={key} value={value} onChange={onChange} />
      ))}
    </>
  )
}

function AttributeRow({ name, value, onChange }: { name: string; value: string; onChange: AttributeChange }) {
  if (name === 'id') return null
  const isColor = name === 'fill' || name === 'stroke'
  return (
    <div className="property-group">
      <label>{name}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type={isColor ? 'color' : 'text'}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          style={{ flex: isColor ? '0 0 32px' : 1, padding: isColor ? 0 : '4px 8px' }}
        />
        {isColor && (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(name, event.target.value)}
            style={{ flex: 1 }}
          />
        )}
      </div>
    </div>
  )
}

function FilterInspector({ onChange }: { onChange: AttributeChange }) {
  return (
    <div className="property-group">
      <label>Filters</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <button className="add-prop-button" onClick={() => onChange('filter', 'blur(5px)')}>
          Blur
        </button>
        <button
          className="add-prop-button"
          onClick={() => onChange('filter', 'drop-shadow(2px 4px 6px black)')}
        >
          Shadow
        </button>
        <button className="add-prop-button" onClick={() => onChange('filter', 'grayscale(1)')}>
          Gray
        </button>
        <button className="add-prop-button" onClick={() => onChange('filter', 'none')}>
          None
        </button>
      </div>
    </div>
  )
}

function PathAction({
  element,
  onSimplify,
  onConvert
}: {
  element: SVGElementNode
  onSimplify: (id: string) => void
  onConvert: (id: string) => void
}) {
  const isPath = element.type === 'path' || element.attributes.d
  return (
    <button
      className="add-prop-button"
      style={{ background: isPath ? '#007acc' : '#28a745', color: '#fff' }}
      onClick={() => (isPath ? onSimplify(element.id) : onConvert(element.id))}
    >
      {isPath ? 'Simplify Path' : 'Convert to Path'}
    </button>
  )
}

function ElementInspector({
  element,
  hasKeyframe,
  onChange,
  onSimplify,
  onConvert
}: {
  element: SVGElementNode
  hasKeyframe: boolean
  onChange: AttributeChange
  onSimplify: (id: string) => void
  onConvert: (id: string) => void
}) {
  return (
    <div className="property-section" style={{ borderTop: hasKeyframe ? '1px solid #333' : 'none' }}>
      <div className="sidebar-header">Properties: {element.name}</div>
      <div className="properties-list">
        <PathInspector element={element} onChange={onChange} />
        <TransformInspector element={element} onChange={onChange} />
        <AppearanceInspector element={element} onChange={onChange} />
        <AnimationInspector element={element} />
        <AttributeInspector element={element} onChange={onChange} />
        <button
          className="add-prop-button"
          onClick={() => {
            const propName = prompt('Enter property name (e.g. fill, stroke, opacity):')
            if (propName) onChange(propName, '')
          }}
        >
          Add Property
        </button>
        <FilterInspector onChange={onChange} />
        <PathAction element={element} onSimplify={onSimplify} onConvert={onConvert} />
      </div>
    </div>
  )
}

/** Shows editable attributes and quick keyframe controls for the current selection. */
export const PropertiesPanel = () => {
  const {
    selectedElementIds,
    elements,
    updateElement,
    selectedKeyframeId,
    keyframes,
    updateKeyframe,
    simplifyPath,
    convertShapeToPath
  } = useStore()

  const selectedElement =
    selectedElementIds.length > 0 ? findElementById(elements, selectedElementIds[0]) : undefined
  const selectedKeyframe = selectedKeyframeId
    ? keyframes.find((keyframe) => keyframe.id === selectedKeyframeId)
    : undefined

  const handleAttrChange = (name: string, value: string) => {
    if (!selectedElement) return
    updateElement(selectedElement.id, { attributes: { ...selectedElement.attributes, [name]: value } })
  }

  if (!selectedElement && !selectedKeyframe) {
    return (
      <div className="properties-panel">
        <div className="sidebar-header">Properties</div>
        <div className="properties-empty">Select an element or keyframe to edit</div>
      </div>
    )
  }

  return (
    <div className="properties-panel">
      {selectedKeyframe && <KeyframeInspector keyframe={selectedKeyframe} onUpdate={updateKeyframe} />}
      {selectedElement && (
        <ElementInspector
          element={selectedElement}
          hasKeyframe={Boolean(selectedKeyframe)}
          onChange={handleAttrChange}
          onSimplify={simplifyPath}
          onConvert={convertShapeToPath}
        />
      )}
    </div>
  )
}
