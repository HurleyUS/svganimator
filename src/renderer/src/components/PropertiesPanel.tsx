import React from 'react'
import { useStore, SVGElementNode } from '../store/useStore'

export const PropertiesPanel = () => {
  const {
    selectedElementIds,
    elements,
    updateElement,
    selectedKeyframeId,
    keyframes,
    updateKeyframe,
    addKeyframe,
    currentTime,
    simplifyPath,
    convertShapeToPath
  } = useStore()

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

  const selectedKeyframe = selectedKeyframeId 
    ? keyframes.find(k => k.id === selectedKeyframeId)
    : undefined

  const handleAttrChange = (name: string, value: string) => {
    if (!selectedElement) return
    const newAttributes = { ...selectedElement.attributes, [name]: value }
    updateElement(selectedElement.id, { attributes: newAttributes })
  }

  const addElementKeyframe = (property: string, fallback: string | number) => {
    if (!selectedElement) return
    addKeyframe({
      elementId: selectedElement.id,
      property,
      time: currentTime,
      value: selectedElement.attributes[property] ?? fallback,
      easing: 'ease-in-out'
    })
  }

  const renderKeyframeProps = () => {
    if (!selectedKeyframe) return null
    return (
      <div className="property-section">
        <div className="sidebar-header">Keyframe: {selectedKeyframe.property}</div>
        <div className="properties-list">
          <div className="property-group">
            <label>Value</label>
            <input 
              type="text" 
              value={selectedKeyframe.value} 
              onChange={(e) => updateKeyframe(selectedKeyframe.id, { value: e.target.value })} 
            />
          </div>
          <div className="property-group">
            <label>Easing</label>
            <select 
              value={selectedKeyframe.easing} 
              onChange={(e) => updateKeyframe(selectedKeyframe.id, { easing: e.target.value })}
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
      {selectedKeyframe && renderKeyframeProps()}
      
      {selectedElement && (
        <div className="property-section" style={{ borderTop: selectedKeyframe ? '1px solid #333' : 'none' }}>
          <div className="sidebar-header">Properties: {selectedElement.name}</div>
          <div className="properties-list">
            <div className="property-group">
              <label>Animate</label>
              <div className="animation-actions">
                <button className="add-prop-button" onClick={() => addElementKeyframe('transform', selectedElement.attributes.transform || 'translate(0 0) scale(1)')}>
                  Position / Scale
                </button>
                <button className="add-prop-button" onClick={() => addElementKeyframe('opacity', selectedElement.attributes.opacity || '1')}>
                  Opacity
                </button>
                <button className="add-prop-button" onClick={() => addElementKeyframe('fill', selectedElement.attributes.fill || '#ffffff')}>
                  Fill
                </button>
              </div>
            </div>
            <div className="property-group">
              <label>ID</label>
              <input 
                type="text" 
                value={selectedElement.attributes.id || ''} 
                onChange={(e) => handleAttrChange('id', e.target.value)} 
              />
            </div>
            {Object.entries(selectedElement.attributes).map(([key, value]) => {
              if (key === 'id') return null
              const isColor = key === 'fill' || key === 'stroke'
              return (
                <div className="property-group" key={key}>
                  <label>{key}</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input 
                      type={isColor ? 'color' : 'text'} 
                      value={value} 
                      onChange={(e) => handleAttrChange(key, e.target.value)} 
                      style={{ flex: isColor ? '0 0 32px' : 1, padding: isColor ? 0 : '4px 8px' }}
                    />
                    {isColor && (
                      <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => handleAttrChange(key, e.target.value)} 
                        style={{ flex: 1 }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            <button className="add-prop-button" onClick={() => {
              const propName = prompt('Enter property name (e.g. fill, stroke, opacity):')
              if (propName) handleAttrChange(propName, '')
            }}>
              Add Property
            </button>
            
            <div className="property-group">
              <label>Filters</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <button className="add-prop-button" onClick={() => handleAttrChange('filter', 'blur(5px)')}>Blur</button>
                <button className="add-prop-button" onClick={() => handleAttrChange('filter', 'drop-shadow(2px 4px 6px black)')}>Shadow</button>
                <button className="add-prop-button" onClick={() => handleAttrChange('filter', 'grayscale(1)')}>Gray</button>
                <button className="add-prop-button" onClick={() => handleAttrChange('filter', 'none')}>None</button>
              </div>
            </div>

            {(selectedElement.type === 'path' || selectedElement.attributes.d) ? (
              <button 
                className="add-prop-button" 
                style={{ background: '#007acc', color: '#fff' }}
                onClick={() => simplifyPath(selectedElement.id)}
              >
                Simplify Path
              </button>
            ) : (
              <button 
                className="add-prop-button" 
                style={{ background: '#28a745', color: '#fff' }}
                onClick={() => convertShapeToPath(selectedElement.id)}
              >
                Convert to Path
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
