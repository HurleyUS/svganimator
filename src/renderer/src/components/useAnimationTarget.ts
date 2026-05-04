import { useStore } from '../store/useStore'
import { getAnimatableProperties } from '../utils/animationProperties'
import { findElementById } from '../utils/svgTree'

/** Resolves the current selected SVG element and its keyframeable property catalog. */
export function useAnimationTarget(targetId?: string) {
  const { elements, selectedElementIds } = useStore()
  const selectedId = targetId ?? selectedElementIds[0]
  const selectedElement = selectedId ? findElementById(elements, selectedId) : undefined
  return {
    selectedId,
    selectedElement,
    properties: getAnimatableProperties(selectedElement)
  }
}
