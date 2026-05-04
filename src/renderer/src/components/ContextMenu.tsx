import React from 'react'
import { useStore } from '../store/useStore'
import { createAnimationKeyframeByName } from '../utils/animationProperties'
import { useAnimationTarget } from './useAnimationTarget'

type MenuState = { x: number; y: number } | null

/** Provides SVGator-style context actions for the current layer or canvas selection. */
export const ContextMenu = ({
  targetId,
  children,
  className,
  onContextMenu,
  ...props
}: {
  targetId?: string
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [menu, setMenu] = React.useState<MenuState>(null)
  const {
    setSelectedElements,
    removeElement,
    groupSelected,
    ungroupSelected,
    alignElements,
    addKeyframe,
    currentTime
  } = useStore()

  const { selectedId, selectedElement, properties } = useAnimationTarget(targetId)

  React.useEffect(() => {
    const close = () => setMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
    }
  }, [])

  const openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    onContextMenu?.(event)
    event.preventDefault()
    event.stopPropagation()
    if (selectedId) setSelectedElements([selectedId])
    setMenu({ x: event.clientX, y: event.clientY })
  }

  const addAnimation = (propertyName: string) => {
    if (!selectedElement) return
    const keyframe = createAnimationKeyframeByName(selectedElement, properties, propertyName, currentTime)
    if (keyframe) addKeyframe(keyframe)
    setMenu(null)
  }

  const runAction = (action: () => void) => {
    action()
    setMenu(null)
  }

  return (
    <div {...props} className={className} onContextMenu={openMenu}>
      {children}
      {menu && selectedElement && (
        <div className="context-menu" style={{ left: menu.x, top: menu.y }}>
          <button className="context-menu-item">
            Copy / Paste <span>▶</span>
          </button>
          <button className="context-menu-item" onClick={() => runAction(groupSelected)}>
            Group <kbd>⌘ G</kbd>
          </button>
          <button className="context-menu-item" onClick={() => runAction(ungroupSelected)}>
            Ungroup <kbd>⇧ ⌘ G</kbd>
          </button>
          <button
            className="context-menu-item"
            onClick={() => runAction(() => removeElement(selectedElement.id))}
          >
            Delete <kbd>⌫</kbd>
          </button>
          <div className="context-separator" />
          <button className="context-menu-item">
            Center origin <kbd>⇧ ⌘ O</kbd>
          </button>
          <div className="context-menu-submenu">
            <button className="context-menu-item context-menu-item-active">
              Animate <span>▶</span>
            </button>
            <div className="context-submenu-panel">
              {properties.map((property, index) => (
                <React.Fragment key={property.property}>
                  {index > 0 && properties[index - 1].group !== property.group && (
                    <div className="context-separator" />
                  )}
                  <button className="context-menu-item" onClick={() => addAnimation(property.property)}>
                    {property.label}
                    <kbd>⇧ {property.shortcut}</kbd>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <button className="context-menu-item">Set motion path</button>
          <button className="context-menu-item" onClick={() => runAction(() => alignElements('left'))}>
            Align <span>▶</span>
          </button>
          <button className="context-menu-item">
            Arrange <span>▶</span>
          </button>
          <button className="context-menu-item">
            Lock <kbd>⌘ L</kbd>
          </button>
          <div className="context-separator" />
          <button className="context-menu-item">Rotate 90° right</button>
          <button className="context-menu-item">Rotate 90° left</button>
          <button className="context-menu-item">Flip horizontal</button>
          <button className="context-menu-item">Flip vertical</button>
        </div>
      )}
    </div>
  )
}
