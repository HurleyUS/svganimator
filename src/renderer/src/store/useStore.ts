import { nanoid } from 'nanoid'
import paper from 'paper'
import { temporal } from 'zundo'
import { create } from 'zustand'
import { getAggregateBounds, getElementBounds } from '../utils/geometry'
import { booleanOperation, shapeToPath } from '../utils/pathOps'
import { collectElements } from '../utils/svgTree'

// Setup paper in headless mode
if (typeof window !== 'undefined') {
  paper.setup(document.createElement('canvas'))
}

/** A parsed SVG node with editor-specific visibility, locking, and child metadata. */
export interface SVGElementNode {
  id: string
  type: string
  name: string
  attributes: Record<string, string>
  children: SVGElementNode[]
  isVisible: boolean
  isLocked: boolean
}

/** A timeline keyframe that animates one SVG attribute for one element. */
export interface Keyframe {
  id: string
  elementId: string
  property: string
  time: number // in milliseconds
  value: string | number
  easing: string
}

interface AppState {
  elements: SVGElementNode[]
  keyframes: Keyframe[]
  selectedElementIds: string[]
  selectedKeyframeId: string | null
  currentTime: number
  duration: number
  isLooping: boolean
  loopRange: [number, number]
  zoom: number
  timelineZoom: number
  pan: { x: number; y: number }

  // Actions
  setElements: (elements: SVGElementNode[]) => void
  addElement: (element: SVGElementNode, parentId?: string) => void
  updateElement: (id: string, updates: Partial<SVGElementNode>) => void
  removeElement: (id: string) => void
  setSelectedElements: (ids: string[]) => void
  setSelectedKeyframe: (id: string | null) => void
  groupSelected: () => void
  ungroupSelected: () => void
  alignElements: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeElements: (direction: 'horizontal' | 'vertical') => void
  simplifyPath: (id: string, tolerance?: number) => void
  convertShapeToPath: (id: string) => void
  applyBooleanOp: (operation: 'unite' | 'intersect' | 'subtract' | 'exclude' | 'divide') => void

  addKeyframe: (keyframe: Omit<Keyframe, 'id'>) => void
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void
  moveKeyframe: (id: string, newTime: number) => void
  removeKeyframe: (id: string) => void

  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  toggleLoop: () => void
  setLoopRange: (range: [number, number]) => void
  setZoom: (zoom: number) => void
  setTimelineZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
}

type AlignType = AppState['alignElements'] extends (type: infer Type) => void ? Type : never
type DistributeDirection = AppState['distributeElements'] extends (direction: infer Direction) => void
  ? Direction
  : never

function isRoundShape(node: SVGElementNode) {
  return node.type === 'circle' || node.type === 'ellipse'
}

function getSelectedNodes(elements: SVGElementNode[], selectedElementIds: string[]) {
  return collectElements(elements, (node) => selectedElementIds.includes(node.id))
}

function alignAttributes(
  node: SVGElementNode,
  type: AlignType,
  bounds: ReturnType<typeof getAggregateBounds>
) {
  const bbox = getElementBounds(node)
  const attributes = {
    ...node.attributes,
    ...getAlignedX(type, bounds, bbox.w),
    ...getAlignedY(type, bounds, bbox.h)
  }

  return isRoundShape(node) ? roundShapeAlignedAttributes(attributes, bbox.w, bbox.h) : attributes
}

function getAlignedX(type: AlignType, bounds: ReturnType<typeof getAggregateBounds>, width: number) {
  if (type === 'left') return { x: bounds.x.toString() }
  if (type === 'right') return { x: (bounds.x + bounds.w - width).toString() }
  if (type === 'center') return { x: (bounds.x + bounds.w / 2 - width / 2).toString() }
  return {}
}

function getAlignedY(type: AlignType, bounds: ReturnType<typeof getAggregateBounds>, height: number) {
  if (type === 'top') return { y: bounds.y.toString() }
  if (type === 'bottom') return { y: (bounds.y + bounds.h - height).toString() }
  if (type === 'middle') return { y: (bounds.y + bounds.h / 2 - height / 2).toString() }
  return {}
}

function roundShapeAlignedAttributes(
  attributes: SVGElementNode['attributes'],
  width: number,
  height: number
) {
  const nextAttributes = { ...attributes }
  if (nextAttributes.x !== undefined)
    nextAttributes.cx = (parseFloat(nextAttributes.x) + width / 2).toString()
  if (nextAttributes.y !== undefined)
    nextAttributes.cy = (parseFloat(nextAttributes.y) + height / 2).toString()
  delete nextAttributes.x
  delete nextAttributes.y
  return nextAttributes
}

function updateSelectedNodes(
  nodes: SVGElementNode[],
  selectedElementIds: string[],
  updateAttributes: (node: SVGElementNode) => SVGElementNode['attributes']
): SVGElementNode[] {
  return nodes.map((node) => {
    if (selectedElementIds.includes(node.id)) return { ...node, attributes: updateAttributes(node) }
    return { ...node, children: updateSelectedNodes(node.children, selectedElementIds, updateAttributes) }
  })
}

function getDistributedAttributes(node: SVGElementNode, direction: DistributeDirection, position: number) {
  const bbox = getElementBounds(node)
  const attributes = { ...node.attributes }
  if (direction === 'horizontal') {
    if (isRoundShape(node)) attributes.cx = (position + bbox.w / 2).toString()
    else attributes.x = position.toString()
  } else if (isRoundShape(node)) {
    attributes.cy = (position + bbox.h / 2).toString()
  } else {
    attributes.y = position.toString()
  }
  return attributes
}

function distributeNodes(
  elements: SVGElementNode[],
  selectedElementIds: string[],
  sorted: SVGElementNode[],
  direction: DistributeDirection,
  gap: number
) {
  let position = direction === 'horizontal' ? getElementBounds(sorted[0]).x : getElementBounds(sorted[0]).y
  const positions = new Map<string, number>()
  for (const node of sorted) {
    positions.set(node.id, position)
    const bbox = getElementBounds(node)
    position += (direction === 'horizontal' ? bbox.w : bbox.h) + gap
  }

  return updateSelectedNodes(elements, selectedElementIds, (node) => {
    return getDistributedAttributes(node, direction, positions.get(node.id) ?? 0)
  })
}

/** Global editor state store for document structure, selection, playback, and transforms. */
export const useStore = create<AppState>()(
  temporal(
    (set) => ({
      elements: [],
      keyframes: [],
      selectedElementIds: [],
      selectedKeyframeId: null,
      currentTime: 0,
      duration: 5000,
      isLooping: false,
      loopRange: [0, 5000],
      zoom: 1,
      timelineZoom: 1,
      pan: { x: 0, y: 0 },

      setElements: (elements) => set({ elements }),

      addElement: (element, parentId) =>
        set((state) => {
          if (!parentId) return { elements: [...state.elements, element] }

          const updateChildren = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.map((node) => {
              if (node.id === parentId) {
                return { ...node, children: [...node.children, element] }
              }
              if (node.children.length > 0) {
                return { ...node, children: updateChildren(node.children) }
              }
              return node
            })
          }
          return { elements: updateChildren(state.elements) }
        }),

      updateElement: (id, updates) =>
        set((state) => {
          const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.map((node) => {
              if (node.id === id) {
                return { ...node, ...updates }
              }
              if (node.children.length > 0) {
                return { ...node, children: updateInNodes(node.children) }
              }
              return node
            })
          }
          return { elements: updateInNodes(state.elements) }
        }),

      removeElement: (id) =>
        set((state) => {
          const removeFromNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes
              .filter((node) => node.id !== id)
              .map((node) => ({
                ...node,
                children: removeFromNodes(node.children)
              }))
          }
          return {
            elements: removeFromNodes(state.elements),
            selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id)
          }
        }),

      setSelectedElements: (ids) => set({ selectedElementIds: ids }),

      setSelectedKeyframe: (id) => set({ selectedKeyframeId: id }),

      groupSelected: () =>
        set((state) => {
          if (state.selectedElementIds.length < 1) return state

          const selectedNodes: SVGElementNode[] = []
          const remainingNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.filter((node) => {
              if (state.selectedElementIds.includes(node.id)) {
                selectedNodes.push(node)
                return false
              }
              node.children = remainingNodes(node.children)
              return true
            })
          }

          const newElements = remainingNodes(state.elements)
          const groupId = `group_${nanoid(4)}`
          const groupNode: SVGElementNode = {
            id: groupId,
            type: 'g',
            name: groupId,
            attributes: { id: groupId },
            children: selectedNodes,
            isVisible: true,
            isLocked: false
          }

          return {
            elements: [...newElements, groupNode],
            selectedElementIds: [groupId]
          }
        }),

      ungroupSelected: () =>
        set((state) => {
          if (state.selectedElementIds.length !== 1) return state
          const groupId = state.selectedElementIds[0]

          let childrenToMove: SVGElementNode[] = []
          const findAndRemoveGroup = (nodes: SVGElementNode[]): SVGElementNode[] => {
            const groupIdx = nodes.findIndex((n) => n.id === groupId && n.type === 'g')
            if (groupIdx !== -1) {
              childrenToMove = nodes[groupIdx].children
              const newNodes = [...nodes]
              newNodes.splice(groupIdx, 1, ...childrenToMove)
              return newNodes
            }
            return nodes.map((node) => ({
              ...node,
              children: findAndRemoveGroup(node.children)
            }))
          }

          const newElements = findAndRemoveGroup(state.elements)
          return {
            elements: newElements,
            selectedElementIds: childrenToMove.map((c) => c.id)
          }
        }),

      alignElements: (type) =>
        set((state) => {
          if (state.selectedElementIds.length < 2) return state

          const selectedNodes = getSelectedNodes(state.elements, state.selectedElementIds)
          const bounds = getAggregateBounds(selectedNodes)
          const elements = updateSelectedNodes(state.elements, state.selectedElementIds, (node) =>
            alignAttributes(node, type, bounds)
          )

          return { elements }
        }),

      distributeElements: (direction) =>
        set((state) => {
          if (state.selectedElementIds.length < 3) return state

          const selectedNodes = getSelectedNodes(state.elements, state.selectedElementIds)

          const sorted = [...selectedNodes].sort((a, b) => {
            const bboxA = getElementBounds(a)
            const bboxB = getElementBounds(b)
            return direction === 'horizontal' ? bboxA.x - bboxB.x : bboxA.y - bboxB.y
          })

          const first = getElementBounds(sorted[0])
          const last = getElementBounds(sorted[sorted.length - 1])

          const span = direction === 'horizontal' ? last.x + last.w - first.x : last.y + last.h - first.y
          const usedSize = sorted.reduce((sum, el) => {
            const bbox = getElementBounds(el)
            return sum + (direction === 'horizontal' ? bbox.w : bbox.h)
          }, 0)
          const gap = (span - usedSize) / (sorted.length - 1)

          return {
            elements: distributeNodes(state.elements, state.selectedElementIds, sorted, direction, gap)
          }
        }),

      simplifyPath: (id, tolerance = 1) =>
        set((state) => {
          const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.map((node) => {
              if (node.id === id && (node.type === 'path' || node.attributes.d)) {
                const p = new paper.Path(node.attributes.d)
                p.simplify(tolerance)
                return {
                  ...node,
                  attributes: { ...node.attributes, d: p.pathData }
                }
              }
              if (node.children.length > 0) {
                return { ...node, children: updateInNodes(node.children) }
              }
              return node
            })
          }
          return { elements: updateInNodes(state.elements) }
        }),

      convertShapeToPath: (id) =>
        set((state) => {
          const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.map((node) => {
              if (node.id === id && node.type !== 'path' && node.type !== 'g') {
                const d = shapeToPath(node.type, node.attributes)
                if (d) {
                  return {
                    ...node,
                    type: 'path',
                    attributes: { ...node.attributes, d }
                  }
                }
              }
              return { ...node, children: updateInNodes(node.children) }
            })
          }
          return { elements: updateInNodes(state.elements) }
        }),

      applyBooleanOp: (operation) =>
        set((state) => {
          if (state.selectedElementIds.length < 2) return state

          const selectedNodes = getSelectedNodes(state.elements, state.selectedElementIds)

          const paths = selectedNodes
            .map((node) => {
              if (node.type === 'path') return node.attributes.d
              return shapeToPath(node.type, node.attributes)
            })
            .filter(Boolean) as string[]

          if (paths.length < 2) return state

          let resultPath = paths[0]
          for (let i = 1; i < paths.length; i++) {
            const results = booleanOperation(resultPath, paths[i], operation)
            if (results.length > 0) resultPath = results[0]
          }

          const remainingNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
            return nodes.filter((node) => {
              if (state.selectedElementIds.includes(node.id)) return false
              node.children = remainingNodes(node.children)
              return true
            })
          }

          const newId = `path_${nanoid(4)}`
          const newNode: SVGElementNode = {
            id: newId,
            type: 'path',
            name: newId,
            attributes: { id: newId, d: resultPath, fill: selectedNodes[0].attributes.fill || '#cccccc' },
            children: [],
            isVisible: true,
            isLocked: false
          }

          return {
            elements: [...remainingNodes(state.elements), newNode],
            selectedElementIds: [newId]
          }
        }),

      addKeyframe: (keyframe) =>
        set((state) => ({
          keyframes: [...state.keyframes, { ...keyframe, id: nanoid() }]
        })),

      updateKeyframe: (id, updates) =>
        set((state) => ({
          keyframes: state.keyframes.map((k) => (k.id === id ? { ...k, ...updates } : k))
        })),

      moveKeyframe: (id, newTime) =>
        set((state) => ({
          keyframes: state.keyframes.map((k) => (k.id === id ? { ...k, time: newTime } : k))
        })),

      removeKeyframe: (id) =>
        set((state) => ({
          keyframes: state.keyframes.filter((k) => k.id !== id)
        })),

      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
      setLoopRange: (loopRange) => set({ loopRange }),
      setZoom: (zoom) => set({ zoom }),
      setTimelineZoom: (timelineZoom) => set({ timelineZoom }),
      setPan: (pan) => set({ pan })
    }),
    {
      partialize: (state) => {
        const { currentTime, pan, zoom, timelineZoom, ...rest } = state
        return rest
      }
    }
  )
)
