import React from 'react'
import { useStore, Keyframe } from '../store/useStore'
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react'

export const Timeline = () => {
  const { 
    currentTime, 
    duration, 
    setCurrentTime, 
    isLooping, 
    toggleLoop,
    selectedElementIds,
    keyframes,
    addKeyframe,
    removeKeyframe,
    moveKeyframe,
    timelineZoom,
    setTimelineZoom,
    selectedKeyframeId,
    setSelectedKeyframe
  } = useStore()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [draggingKeyframeId, setDraggingKeyframeId] = React.useState<string | null>(null)
  const requestRef = React.useRef<number>(null)
  const startTimeRef = React.useRef<number>(null)

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time - currentTime
    const progress = time - startTimeRef.current
    
    let nextTime = progress
    if (nextTime >= duration) {
      if (isLooping) {
        nextTime = nextTime % duration
        startTimeRef.current = time - nextTime
      } else {
        nextTime = duration
        setIsPlaying(false)
      }
    }
    
    setCurrentTime(nextTime)
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate)
    }
  }

  React.useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate)
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      startTimeRef.current = null
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isPlaying, isLooping])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value, 10)
    setCurrentTime(newTime)
    if (isPlaying) {
      startTimeRef.current = performance.now() - newTime
    }
  }

  const handleKeyframeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDraggingKeyframeId(id)
    setSelectedKeyframe(id)
  }

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (draggingKeyframeId) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newTime = Math.min(Math.max((x / rect.width) * duration, 0), duration)
      moveKeyframe(draggingKeyframeId, newTime)
    }
  }

  const handleTimelineMouseUp = () => {
    setDraggingKeyframeId(null)
  }

  return (
    <div className="timeline-container" onMouseUp={handleTimelineMouseUp}>
      <div className="timeline-controls">
        <button className="control-button" onClick={() => setCurrentTime(0)}><SkipBack size={16} /></button>
        <button className="control-button" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="control-button" onClick={() => setCurrentTime(duration)}><SkipForward size={16} /></button>
        <button className={`control-button ${isLooping ? 'active' : ''}`} onClick={toggleLoop}><Repeat size={16} /></button>
        <div className="time-display">
          {Math.floor(currentTime)}ms / {duration}ms
        </div>
        <div className="zoom-controls" style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button className="control-button" onClick={() => setTimelineZoom(Math.max(timelineZoom * 0.8, 0.1))}>-</button>
          <span style={{ fontSize: 11, alignSelf: 'center' }}>{Math.round(timelineZoom * 100)}%</span>
          <button className="control-button" onClick={() => setTimelineZoom(Math.min(timelineZoom * 1.2, 10))}>+</button>
        </div>
      </div>
      <div className="timeline-scroll-container" style={{ flex: 1, overflow: 'auto' }}>
        <div 
          className="timeline-content" 
          style={{ width: `${100 * timelineZoom}%`, minWidth: '100%', position: 'relative' }}
          onMouseMove={handleTimelineMouseMove}
        >
          <div className="timeline-scrubber">
            <input 
              type="range" 
              min="0" 
              max={duration} 
              value={currentTime} 
              onChange={handleSeek}
              className="scrubber-range"
            />
          </div>
          <div className="timeline-tracks">
            {selectedElementIds.length > 0 ? (
              <div className="element-tracks">
                {['opacity', 'fill', 'stroke', 'transform', 'd'].map((prop) => (
                  <div key={prop} className="track">
                    <div className="track-label">{prop}</div>
                    <div className="track-area" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const time = ((e.clientX - rect.left) / rect.width) * duration
                      addKeyframe({
                        elementId: selectedElementIds[0],
                        property: prop,
                        time,
                        value: prop === 'opacity' ? 1 : prop === 'fill' ? '#ffffff' : prop === 'stroke' ? '#000000' : prop === 'd' ? '' : 'translate(0,0)',
                        easing: 'linear'
                      })
                    }}>
                      {keyframes
                        .filter(k => k.elementId === selectedElementIds[0] && k.property === prop)
                        .map(k => (
                          <div 
                            key={k.id} 
                            className={`keyframe ${selectedKeyframeId === k.id ? 'selected' : ''}`}
                            style={{ left: `${(k.time / duration) * 100}%` }}
                            onMouseDown={(e) => handleKeyframeMouseDown(e, k.id)}
                            onClick={(e) => { e.stopPropagation(); setSelectedKeyframe(k.id); }}
                            onContextMenu={(e) => { e.preventDefault(); removeKeyframe(k.id); }}
                          />
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tracks-empty">Select an element to add keyframes</div>
            )}
          </div>
          <div 
            className="time-indicator"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(currentTime / duration) * 100}%`,
              width: 1,
              background: '#007acc',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        </div>
      </div>
    </div>
  )
}
