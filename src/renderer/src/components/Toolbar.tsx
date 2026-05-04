import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Box,
  Combine,
  Download,
  FolderOpen,
  Grid3X3,
  Group,
  Hand,
  MousePointer2,
  PenTool,
  Power,
  Redo,
  Save,
  Scissors,
  Type,
  Undo,
  Ungroup,
  Upload,
  ZoomIn
} from 'lucide-react'
import React from 'react'
import { useStore as useZustandStore } from 'zustand'
import { useStore } from '../store/useStore'
import { exportToSVG } from '../utils/exporter'
import { parseSVG } from '../utils/svgParser'

/** Hosts project, import/export, alignment, grouping, and drawing tool commands. */
export const Toolbar = () => {
  const {
    elements,
    keyframes,
    duration,
    setElements,
    setSelectedElements,
    groupSelected,
    ungroupSelected,
    alignElements,
    distributeElements,
    applyBooleanOp
  } = useStore()
  const { undo, redo, pastStates, futureStates } = useZustandStore(useStore.temporal, (state) => state)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleSaveProject = () => {
    const state = useStore.getState()
    const data = JSON.stringify(state)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'project.svganim'
    a.click()
  }

  const importSVGString = (svgString: string) => {
    const elements = parseSVG(svgString)
    setElements(elements)
    const firstVisibleElement = elements.find(
      (element) => element.type !== 'defs' && element.type !== 'clipPath' && element.type !== 'mask'
    )
    setSelectedElements(firstVisibleElement ? [firstVisibleElement.id] : [])
  }

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const fileContents = event.target?.result as string

      if (file.name.toLowerCase().endsWith('.svg')) {
        importSVGString(fileContents)
        return
      }

      const data = JSON.parse(fileContents)
      useStore.setState(data)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = () => {
    const svgString = exportToSVG(elements, keyframes, duration)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'animation.svg'
    a.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const svgString = event.target?.result as string
      importSVGString(svgString)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="toolbar">
      <div className="app-menu" title="Main menu">
        <div className="app-mark">S</div>
      </div>
      <div className="project-name">Untitled</div>
      <div className="toolbar-group">
        <button className="toolbar-button" title="Save Project" onClick={handleSaveProject}>
          <Save size={18} />
        </button>
        <label className="toolbar-button" title="Open SVG or Project">
          <FolderOpen size={18} />
          <input type="file" accept=".svg,.svganim" onChange={handleOpenFile} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group tools-primary">
        <button className="toolbar-button active" title="Select">
          <MousePointer2 size={18} />
        </button>
        <button className="toolbar-button" title="Pen">
          <PenTool size={18} />
        </button>
        <button className="toolbar-button" title="Shape">
          <Box size={18} />
        </button>
        <button className="toolbar-button" title="Text">
          <Type size={18} />
        </button>
        <button className="toolbar-button" title="Pan">
          <Hand size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-button" title="Undo" onClick={undo} disabled={pastStates.length === 0}>
          <Undo size={18} />
        </button>
        <button className="toolbar-button" title="Redo" onClick={redo} disabled={futureStates.length === 0}>
          <Redo size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label className="toolbar-button" title="Import SVG">
          <Upload size={18} />
          <input type="file" accept=".svg" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <button className="toolbar-button" title="Export SVG" onClick={handleExport}>
          <Download size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-button" title="Group" onClick={groupSelected}>
          <Group size={18} />
        </button>
        <button className="toolbar-button" title="Ungroup" onClick={ungroupSelected}>
          <Ungroup size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-button" title="Align Left" onClick={() => alignElements('left')}>
          <AlignLeft size={18} />
        </button>
        <button className="toolbar-button" title="Align Center" onClick={() => alignElements('center')}>
          <AlignCenter size={18} />
        </button>
        <button className="toolbar-button" title="Align Right" onClick={() => alignElements('right')}>
          <AlignRight size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-button" title="Align Top" onClick={() => alignElements('top')}>
          <AlignVerticalJustifyStart size={18} />
        </button>
        <button className="toolbar-button" title="Align Middle" onClick={() => alignElements('middle')}>
          <AlignVerticalJustifyCenter size={18} />
        </button>
        <button className="toolbar-button" title="Align Bottom" onClick={() => alignElements('bottom')}>
          <AlignVerticalJustifyEnd size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-button"
          title="Distribute Horizontally"
          onClick={() => distributeElements('horizontal')}
        >
          <AlignCenter size={18} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <button
          className="toolbar-button"
          title="Distribute Vertically"
          onClick={() => distributeElements('vertical')}
        >
          <AlignCenter size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-button" title="Unite" onClick={() => applyBooleanOp('unite')}>
          <Combine size={18} />
        </button>
        <button className="toolbar-button" title="Intersect" onClick={() => applyBooleanOp('intersect')}>
          <Scissors size={18} style={{ transform: 'rotate(45deg)' }} />
        </button>
        <button className="toolbar-button" title="Subtract" onClick={() => applyBooleanOp('subtract')}>
          <Scissors size={18} />
        </button>
        <button className="toolbar-button" title="Exclude" onClick={() => applyBooleanOp('exclude')}>
          <Box size={18} />
        </button>
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-group">
        <button className="toolbar-button" title="Snap">
          <Grid3X3 size={18} />
        </button>
        <button className="toolbar-button" title="Zoom">
          <ZoomIn size={18} />
        </button>
        <button className="toolbar-button active" title="Preview">
          <Power size={18} />
        </button>
      </div>
      <button className="export-button" onClick={handleExport}>
        Export
      </button>
    </div>
  )
}
