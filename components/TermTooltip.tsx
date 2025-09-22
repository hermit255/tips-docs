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
      <div>
        <strong>{term.title}</strong>
      </div>
      {term.summary && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          {term.summary}
        </div>
      )}
      {term.synonyms && term.synonyms.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          <strong>類義語:</strong> {term.synonyms.join(', ')}
        </div>
      )}
      {term.antonyms && term.antonyms.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          <strong>対比語:</strong> {term.antonyms.join(', ')}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#ccc' }}>
        クリックで詳細表示
      </div>
    </div>
  )
}
