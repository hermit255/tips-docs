'use client'

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className="resize-handle"
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '4px',
        height: '100%',
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        zIndex: 10,
        borderLeft: '2px solid transparent',
        transition: 'border-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = '#007acc'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = 'transparent'
      }}
    />
  )
}
