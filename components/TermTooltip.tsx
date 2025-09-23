'use client'

import { TermFile } from '@/lib/markdown-client'

interface TermTooltipProps {
  term: TermFile
  x: number
  y: number
  onClick: () => void
}

// HTMLタグを除去してプレーンテキストに変換する関数
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  return html
    .replace(/<[^>]*>/g, '') // HTMLタグを除去
    .replace(/&nbsp;/g, ' ') // 非改行スペースを通常のスペースに変換
    .replace(/&amp;/g, '&') // HTMLエンティティを変換
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // 連続する空白を1つに統一
    .trim()
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
          {stripHtmlTags(term.summary)}
        </div>
      )}
      {term.synonyms && term.synonyms.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#ddd' }}>
          類義語: {term.synonyms.slice(0, 3).join(', ')}
          {term.synonyms.length > 3 && '...'}
        </div>
      )}
      {term.antonyms && term.antonyms.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#ddd' }}>
          対義語: {term.antonyms.slice(0, 3).join(', ')}
          {term.antonyms.length > 3 && '...'}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#ccc' }}>
        クリックで詳細表示
      </div>
    </div>
  )
}
