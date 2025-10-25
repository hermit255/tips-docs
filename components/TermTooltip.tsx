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

// HTMLからsummaryセクションを抽出する関数
function extractSummaryFromHtml(html: string): string {
  if (!html) return ''
  
  // summaryセクションを抽出（改行を含む）
  const summaryMatch = html.match(/<h2[^>]*id="summary"[^>]*>.*?<\/h2>([\s\S]*?)(?=<h2|$)/)
  if (summaryMatch) {
    return summaryMatch[1].trim()
  }
  
  // summaryセクションが見つからない場合は、最初の段落を返す
  const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)
  if (firstParagraph) {
    return firstParagraph[1].trim()
  }
  
  return ''
}

// HTMLからsynonymsセクションを抽出する関数
function extractSynonymsFromHtml(html: string): string[] {
  if (!html) return []
  
  const synonymsMatch = html.match(/<h2[^>]*id="synonyms"[^>]*>.*?<\/h2>([\s\S]*?)(?=<h2|$)/)
  if (synonymsMatch) {
    const synonymsText = stripHtmlTags(synonymsMatch[1])
    return synonymsText.split(/\s+/).filter(s => s.length > 0)
  }
  
  return []
}

export function TermTooltip({ term, x, y, onClick }: TermTooltipProps) {
  const summary = extractSummaryFromHtml(term.html)
  const synonyms = extractSynonymsFromHtml(term.html)
  
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
      {summary && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          {renderHtmlSafely(summary)}
        </div>
      )}
      {synonyms.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#ddd' }}>
          類義語: {synonyms.slice(0, 3).join(', ')}
          {synonyms.length > 3 && '...'}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#ccc' }}>
        クリックで詳細表示
      </div>
    </div>
  )
}
