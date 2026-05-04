import { ChevronRight, Plus } from 'lucide-react'
import React from 'react'
import { useStore } from '../store/useStore'
import { createAnimationKeyframeByName } from '../utils/animationProperties'
import { useAnimationTarget } from './useAnimationTarget'

/** Shows keyframeable SVG properties and creates a timeline track/keyframe for the selection. */
export const AnimateMenu = ({ align = 'left' }: { align?: 'left' | 'right' }) => {
  const { addKeyframe, currentTime } = useStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const { selectedElement, properties } = useAnimationTarget()

  const addAnimation = (propertyName: string) => {
    if (!selectedElement) return
    const keyframe = createAnimationKeyframeByName(selectedElement, properties, propertyName, currentTime)
    if (keyframe) addKeyframe(keyframe)
    setIsOpen(false)
  }

  return (
    <div className="animate-menu">
      <button
        className="animate-button"
        disabled={!selectedElement}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Plus size={14} />
        Animate
        <ChevronRight size={14} />
      </button>
      {isOpen && selectedElement && (
        <div className={`menu-popover ${align === 'right' ? 'menu-popover-right' : ''}`}>
          {properties.map((property, index) => {
            const isFirstInGroup = index === 0 || properties[index - 1].group !== property.group
            return (
              <React.Fragment key={`${property.group}-${property.property}`}>
                {isFirstInGroup && <div className="menu-section-label">{property.group}</div>}
                <button className="menu-item" onClick={() => addAnimation(property.property)}>
                  <span>{property.label}</span>
                  <kbd>⇧ {property.shortcut}</kbd>
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
