'use client'

import { TermFile } from '@/lib/markdown-client'

interface TermTooltipProps {
  term: TermFile
  x: number
  y: number
  onClick: () => void
}

// HTMLタグを除去してプレーンテキストに変換する関数（画像は除外）
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  return html
    .replace(/<img[^>]*>/g, '[画像]') // 画像タグを[画像]に置換
    .replace(/<[^>]*>/g, '') // その他のHTMLタグを除去
    .replace(/&nbsp;/g, ' ') // 非改行スペースを通常のスペースに変換
    .replace(/&amp;/g, '&') // HTMLエンティティを変換
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // 連続する空白を1つに統一
    .trim()
}

// HTMLを安全に表示する関数（画像を含む）
function renderHtmlSafely(html: string): JSX.Element {
  if (!html) return <></>
  
  // 画像タグのsrc属性を安全に処理
  const processedHtml = html.replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/g, (match, before, src, after) => {
    // 相対パスの画像をAPIエンドポイント経由に変換
    if (!src.startsWith('http') && !src.startsWith('/api/')) {
      const encodedSrc = encodeURIComponent(src)
      return `<img${before}src="/api/images/${encodedSrc}" style="max-width: 100%; height: auto; max-height: 150px;"${after}>`
    }
    return match.replace(/<img/, '<img style="max-width: 100%; height: auto; max-height: 150px;"')
  })
  
  return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
}

export function TermTooltip({ term, x, y, onClick }: TermTooltipProps) {
  return (
    <div
      className="tooltip"
      style={{
        left: `${x + 10}px`,
        top: `${y - 10}px`,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
      }}
      onClick={onClick}
    >
      {term.summary && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          {renderHtmlSafely(term.summary)}
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
