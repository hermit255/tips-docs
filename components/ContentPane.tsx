'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile, extractTocFromHtml, processContentWithLinks } from '@/lib/markdown-client'
import { TermTooltip } from './TermTooltip'

interface ContentPaneProps {
  selectedDoc: string | null
  selectedTerm: string | null
  terms: TermFile[]
  docs: DocFile[]
  projectName: string
  onTermSelect: (termPath: string) => void
  onDocSelect: (docPath: string) => void
}

export function ContentPane({ selectedDoc, selectedTerm, terms, docs, projectName, onTermSelect, onDocSelect }: ContentPaneProps) {
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [term, setTerm] = useState<TermFile | null>(null)
  const [loading, setLoading] = useState(false)
  const [tooltip, setTooltip] = useState<{term: TermFile, x: number, y: number} | null>(null)

  useEffect(() => {
    if (selectedDoc && projectName) {
      console.log('ContentPane: Loading doc with path:', selectedDoc, 'project:', projectName)
      setLoading(true)
      
      // 静的データを読み込み
      import('@/lib/markdown-client-static').then(({ getDocFiles }) => {
        getDocFiles(projectName).then(docs => {
          const doc = docs.find(d => d.path === selectedDoc)
          if (doc) {
            console.log('ContentPane: Found doc:', doc.path)
            setDoc(doc)
            setTerm(null)
          } else {
            console.log('ContentPane: Doc not found:', selectedDoc)
            setDoc(null)
          }
        }).catch(err => {
          console.error('ContentPane: Failed to load doc:', err)
          setDoc(null)
        }).finally(() => setLoading(false))
      })
    }
  }, [selectedDoc, projectName])

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

  const handleTermMouseEnter = (termPath: string, event: React.MouseEvent) => {
    const termData = terms.find(t => t.path === termPath)
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

  const handleTermClick = (termPath: string) => {
    // 用語選択はするが、コンテンツペインでは用語ページを表示しない
    onTermSelect(termPath)
    setTooltip(null)
  }


  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termPath = target.getAttribute('data-term')
      if (termPath) {
        handleTermClick(termPath)
      }
    } else if (target.classList.contains('doc-link')) {
      const docPath = target.getAttribute('data-doc')
      if (docPath) {
        onDocSelect(docPath)
      }
    } else {
      // その他の場所をクリックした場合はtooltipを非表示
      setTooltip(null)
    }
  }

  const handleContentMouseMove = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termPath = target.getAttribute('data-term')
      if (termPath) {
        // 既にtooltipが表示されている場合は位置を更新しない
        if (!tooltip) {
          handleTermMouseEnter(termPath, event)
        }
      }
    } else {
      // term-link以外にマウスが移動した場合はtooltipを非表示
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
    console.log('ContentPane: Processing content with links for doc:', doc.title)
    console.log('ContentPane: Available terms:', terms.map(t => t.title))
    console.log('ContentPane: Original HTML:', doc.html)
    const processedHtml = processContentWithLinks(doc.html, terms, docs, doc.title)
    console.log('ContentPane: Processed HTML:', processedHtml)
    
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
