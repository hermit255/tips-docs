'use client'

import { TermFile } from '@/lib/markdown-client'

interface TermTooltipProps {
  term: TermFile
  x: number
  y: number
  onClick: () => void
}

export function TermTooltip({ term, x, y, onClick }: TermTooltipProps) {
  return (
    <div
      className="tooltip"
      style={{
        left: `${x + 10}px`,
        top: `${y - 10}px`,
      }}
      onClick={onClick}
    >
      {term.summary && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          {term.summary}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#ccc' }}>
        クリックで詳細表示
      </div>
    </div>
  )
}
