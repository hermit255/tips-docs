'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile, extractTocFromHtml } from '@/lib/markdown-client'
import { TermTooltip } from './TermTooltip'

interface ContentPaneProps {
  selectedDoc: string | null
  selectedTerm: string | null
  terms: TermFile[]
  onTermSelect: (termSlug: string) => void
}

export function ContentPane({ selectedDoc, selectedTerm, terms, onTermSelect }: ContentPaneProps) {
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [term, setTerm] = useState<TermFile | null>(null)
  const [loading, setLoading] = useState(false)
  const [tooltip, setTooltip] = useState<{term: TermFile, x: number, y: number} | null>(null)

  useEffect(() => {
    if (selectedDoc) {
      setLoading(true)
      fetch(`/api/docs/${selectedDoc}`)
        .then(res => res.json())
        .then(data => {
          setDoc(data)
          setTerm(null)
        })
        .catch(err => console.error('Failed to fetch doc:', err))
        .finally(() => setLoading(false))
    }
  }, [selectedDoc])

  // 用語選択時はContentPaneでは何もしない（サブペインで表示するため）
  // useEffect(() => {
  //   if (selectedTerm) {
  //     setLoading(true)
  //     fetch(`/api/terms/${selectedTerm}`)
  //       .then(res => res.json())
  //       .then(data => {
  //         setTerm(data)
  //         setDoc(null)
  //       })
  //       .catch(err => console.error('Failed to fetch term:', err))
  //       .finally(() => setLoading(false))
  //   }
  // }, [selectedTerm])

  const handleTermMouseEnter = (termSlug: string, event: React.MouseEvent) => {
    const termData = terms.find(t => t.slug === termSlug)
    if (termData) {
      setTooltip({
        term: termData,
        x: event.clientX,
        y: event.clientY
      })
    }
  }

  const handleTermMouseLeave = () => {
    setTooltip(null)
  }

  const handleTermClick = (termSlug: string) => {
    // 用語選択はするが、コンテンツペインでは用語ページを表示しない
    onTermSelect(termSlug)
    setTooltip(null)
  }

  const processContentWithTermLinks = (html: string) => {
    let processedHtml = html
    
    // 用語ファイル名と一致するテキストを特殊リンクに変換
    terms.forEach(term => {
      const termName = term.title
      // ##で囲まれたテキストは除外
      const regex = new RegExp(`(?<!##)${termName}(?!##)`, 'g')
      processedHtml = processedHtml.replace(regex, (match) => {
        return `<span class="term-link" data-term="${term.slug}">${match}</span>`
      })
    })
    
    return processedHtml
  }

  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termSlug = target.getAttribute('data-term')
      if (termSlug) {
        handleTermClick(termSlug)
      }
    }
  }

  const handleContentMouseMove = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termSlug = target.getAttribute('data-term')
      if (termSlug) {
        handleTermMouseEnter(termSlug, event)
      }
    } else {
      setTooltip(null)
    }
  }

  if (loading) {
    return (
      <div className="content-pane">
        <div>読み込み中...</div>
      </div>
    )
  }

  // 用語ページはコンテンツペインでは表示しない（サブペインで表示）

  if (doc) {
    const processedHtml = processContentWithTermLinks(doc.html)
    
    return (
      <div className="content-pane">
        <h1>{doc.title}</h1>
        <div 
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          onClick={handleContentClick}
          onMouseMove={handleContentMouseMove}
        />
        {tooltip && (
          <TermTooltip
            term={tooltip.term}
            x={tooltip.x}
            y={tooltip.y}
            onClick={() => handleTermClick(tooltip.term.slug)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="content-pane">
      <div>ドキュメントまたは用語を選択してください</div>
    </div>
  )
}
