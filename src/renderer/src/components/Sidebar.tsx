import React from 'react'
import { useStore, SVGElementNode } from '../store/useStore'
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Box } from 'lucide-react'

const LayerItem = ({ node, depth = 0 }: { node: SVGElementNode; depth?: number }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  const { selectedElementIds, setSelectedElements, updateElement } = useStore()
  const isSelected = selectedElementIds.includes(node.id)

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateElement(node.id, { isVisible: !node.isVisible })
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateElement(node.id, { isLocked: !node.isLocked })
  }

  return (
    <div className="layer-item-container">
      <div 
        className={`layer-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => setSelectedElements([node.id])}
      >
        <div className="layer-expander" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
          {node.children.length > 0 ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div style={{ width: 14 }} />}
        </div>
        <Box size={14} className="layer-icon" />
        <span className="layer-name">{node.name}</span>
        <div className="layer-actions">
          <div onClick={toggleVisibility}>{node.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}</div>
          <div onClick={toggleLock}>{node.isLocked ? <Lock size={14} /> : <Unlock size={14} />}</div>
        </div>
      </div>
      {isOpen && node.children.length > 0 && (
        <div className="layer-children">
          {node.children.map((child) => (
            <LayerItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export const Sidebar = () => {
  const { elements } = useStore()

  return (
    <div className="sidebar-content">
      <div className="sidebar-header">Layers</div>
      <div className="layers-list">
        {elements.map((el) => (
          <LayerItem key={el.id} node={el} />
        ))}
      </div>
    </div>
  )
}
