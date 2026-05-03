import { create } from 'zustand'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import paper from 'paper'
import { booleanOperation, shapeToPath } from '../utils/pathOps'

// Setup paper in headless mode
if (typeof window !== 'undefined') {
  paper.setup(document.createElement('canvas'))
}

export interface SVGElementNode {
  id: string
  type: string
  name: string
  attributes: Record<string, string>
  children: SVGElementNode[]
  isVisible: boolean
  isLocked: boolean
}

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

export const useStore = create<AppState>()(
  temporal((set) => ({
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
    
    addElement: (element, parentId) => set((state) => {
      if (!parentId) return { elements: [...state.elements, element] }
      
      const updateChildren = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.map(node => {
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

    updateElement: (id, updates) => set((state) => {
      const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.map(node => {
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

    removeElement: (id) => set((state) => {
      const removeFromNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.filter(node => node.id !== id).map(node => ({
          ...node,
          children: removeFromNodes(node.children)
        }))
      }
      return {
        elements: removeFromNodes(state.elements),
        selectedElementIds: state.selectedElementIds.filter(sid => sid !== id)
      }
    }),

    setSelectedElements: (ids) => set({ selectedElementIds: ids }),

    setSelectedKeyframe: (id) => set({ selectedKeyframeId: id }),

    groupSelected: () => set((state) => {
      if (state.selectedElementIds.length < 1) return state
      
      const selectedNodes: SVGElementNode[] = []
      const remainingNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.filter(node => {
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

    ungroupSelected: () => set((state) => {
      if (state.selectedElementIds.length !== 1) return state
      const groupId = state.selectedElementIds[0]
      
      let childrenToMove: SVGElementNode[] = []
      const findAndRemoveGroup = (nodes: SVGElementNode[]): SVGElementNode[] => {
        const groupIdx = nodes.findIndex(n => n.id === groupId && n.type === 'g')
        if (groupIdx !== -1) {
          childrenToMove = nodes[groupIdx].children
          const newNodes = [...nodes]
          newNodes.splice(groupIdx, 1, ...childrenToMove)
          return newNodes
        }
        return nodes.map(node => ({
          ...node,
          children: findAndRemoveGroup(node.children)
        }))
      }

      const newElements = findAndRemoveGroup(state.elements)
      return { 
        elements: newElements,
        selectedElementIds: childrenToMove.map(c => c.id)
      }
    }),

    alignElements: (type) => set((state) => {
      if (state.selectedElementIds.length < 2) return state

      const getBBox = (el: SVGElementNode) => {
        const x = parseFloat(el.attributes.x || el.attributes.cx || '0')
        const y = parseFloat(el.attributes.y || el.attributes.cy || '0')
        const w = parseFloat(el.attributes.width || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '0'))
        const h = parseFloat(el.attributes.height || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '0'))
        return { x, y, w, h }
      }

      const selectedNodes: SVGElementNode[] = []
      const findSelected = (nodes: SVGElementNode[]) => {
        nodes.forEach(node => {
          if (state.selectedElementIds.includes(node.id)) selectedNodes.push(node)
          findSelected(node.children)
        })
      }
      findSelected(state.elements)

      const bboxes = selectedNodes.map(getBBox)
      const minX = Math.min(...bboxes.map(b => b.x))
      const maxX = Math.max(...bboxes.map(b => b.x + b.w))
      const minY = Math.min(...bboxes.map(b => b.y))
      const maxY = Math.max(...bboxes.map(b => b.y + b.h))
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      const newElements = [...state.elements]
      const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.map(node => {
          if (state.selectedElementIds.includes(node.id)) {
            const bbox = getBBox(node)
            const updates: any = { attributes: { ...node.attributes } }
            
            if (type === 'left') updates.attributes.x = minX.toString()
            if (type === 'right') updates.attributes.x = (maxX - bbox.w).toString()
            if (type === 'center') updates.attributes.x = (centerX - bbox.w / 2).toString()
            if (type === 'top') updates.attributes.y = minY.toString()
            if (type === 'bottom') updates.attributes.y = (maxY - bbox.h).toString()
            if (type === 'middle') updates.attributes.y = (centerY - bbox.h / 2).toString()

            // Handle circle/ellipse cx/cy
            if (node.type === 'circle' || node.type === 'ellipse') {
              if (updates.attributes.x !== undefined) {
                updates.attributes.cx = (parseFloat(updates.attributes.x) + bbox.w / 2).toString()
                delete updates.attributes.x
              }
              if (updates.attributes.y !== undefined) {
                updates.attributes.cy = (parseFloat(updates.attributes.y) + bbox.h / 2).toString()
                delete updates.attributes.y
              }
            }

            return { ...node, ...updates }
          }
          return { ...node, children: updateInNodes(node.children) }
        })
      }

      return { elements: updateInNodes(newElements) }
      }),

      distributeElements: (direction) => set((state) => {
      if (state.selectedElementIds.length < 3) return state

      const getBBox = (el: SVGElementNode) => {
        const x = parseFloat(el.attributes.x || el.attributes.cx || '0')
        const y = parseFloat(el.attributes.y || el.attributes.cy || '0')
        const w = parseFloat(el.attributes.width || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '0'))
        const h = parseFloat(el.attributes.height || (el.attributes.r ? String(parseFloat(el.attributes.r)*2) : '0'))
        return { x, y, w, h }
      }

      const selectedNodes: SVGElementNode[] = []
      const findSelected = (nodes: SVGElementNode[]) => {
        nodes.forEach(node => {
          if (state.selectedElementIds.includes(node.id)) selectedNodes.push(node)
          findSelected(node.children)
        })
      }
      findSelected(state.elements)

      const sorted = [...selectedNodes].sort((a, b) => {
        const bboxA = getBBox(a)
        const bboxB = getBBox(b)
        return direction === 'horizontal' ? bboxA.x - bboxB.x : bboxA.y - bboxB.y
      })

      const first = getBBox(sorted[0])
      const last = getBBox(sorted[sorted.length - 1])

      if (direction === 'horizontal') {
        const totalWidth = (last.x + last.w) - first.x
        const sumWidths = sorted.reduce((sum, el) => sum + getBBox(el).w, 0)
        const gap = (totalWidth - sumWidths) / (sorted.length - 1)

        let currentX = first.x
        const newElements = [...state.elements]
        const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
          return nodes.map(node => {
            const idx = sorted.findIndex(s => s.id === node.id)
            if (idx !== -1) {
              const bbox = getBBox(node)
              const updates: any = { attributes: { ...node.attributes } }
              if (node.type === 'circle' || node.type === 'ellipse') {
                updates.attributes.cx = (currentX + bbox.w / 2).toString()
              } else {
                updates.attributes.x = currentX.toString()
              }
              currentX += bbox.w + gap
              return { ...node, ...updates }
            }
            return { ...node, children: updateInNodes(node.children) }
          })
        }
        return { elements: updateInNodes(newElements) }
      } else {
        const totalHeight = (last.y + last.h) - first.y
        const sumHeights = sorted.reduce((sum, el) => sum + getBBox(el).h, 0)
        const gap = (totalHeight - sumHeights) / (sorted.length - 1)

        let currentY = first.y
        const newElements = [...state.elements]
        const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
          return nodes.map(node => {
            const idx = sorted.findIndex(s => s.id === node.id)
            if (idx !== -1) {
              const bbox = getBBox(node)
              const updates: any = { attributes: { ...node.attributes } }
              if (node.type === 'circle' || node.type === 'ellipse') {
                updates.attributes.cy = (currentY + bbox.h / 2).toString()
              } else {
                updates.attributes.y = currentY.toString()
              }
              currentY += bbox.h + gap
              return { ...node, ...updates }
            }
            return { ...node, children: updateInNodes(node.children) }
          })
        }
        return { elements: updateInNodes(newElements) }
      }
      }),

      simplifyPath: (id, tolerance = 1) => set((state) => {      const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.map(node => {
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

    convertShapeToPath: (id) => set((state) => {
      const updateInNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.map(node => {
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

    applyBooleanOp: (operation) => set((state) => {
      if (state.selectedElementIds.length < 2) return state
      
      const selectedNodes: SVGElementNode[] = []
      const findSelected = (nodes: SVGElementNode[]) => {
        nodes.forEach(node => {
          if (state.selectedElementIds.includes(node.id)) selectedNodes.push(node)
          findSelected(node.children)
        })
      }
      findSelected(state.elements)

      const paths = selectedNodes.map(node => {
        if (node.type === 'path') return node.attributes.d
        return shapeToPath(node.type, node.attributes)
      }).filter(Boolean) as string[]

      if (paths.length < 2) return state

      let resultPath = paths[0]
      for (let i = 1; i < paths.length; i++) {
        const results = booleanOperation(resultPath, paths[i], operation)
        if (results.length > 0) resultPath = results[0]
      }

      const remainingNodes = (nodes: SVGElementNode[]): SVGElementNode[] => {
        return nodes.filter(node => {
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

    addKeyframe: (keyframe) => set((state) => ({
      keyframes: [...state.keyframes, { ...keyframe, id: nanoid() }]
    })),

    updateKeyframe: (id, updates) => set((state) => ({
      keyframes: state.keyframes.map(k => k.id === id ? { ...k, ...updates } : k)
    })),

    moveKeyframe: (id, newTime) => set((state) => ({
      keyframes: state.keyframes.map(k => k.id === id ? { ...k, time: newTime } : k)
    })),

    removeKeyframe: (id) => set((state) => ({
      keyframes: state.keyframes.filter(k => k.id !== id)
    })),

    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
    setLoopRange: (loopRange) => set({ loopRange }),
    setZoom: (zoom) => set({ zoom }),
    setTimelineZoom: (timelineZoom) => set({ timelineZoom }),
    setPan: (pan) => set({ pan })
  }), {
    partialize: (state) => {
      const { currentTime, pan, zoom, timelineZoom, ...rest } = state
      return rest
    }
  })
)
