'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile } from '@/types'
import { extractTocFromHtml, processContentWithLinks } from '@/lib/markdown-client'
import { TermTooltip } from './TermTooltip'
import { ResizeHandle } from './ResizeHandle'
import { useResizable } from '@/hooks/useResizable'

interface SubPaneProps {
  tab: 'toc' | 'preview'
  onTabChange: (tab: 'toc' | 'preview') => void
  selectedDoc: string | null
  selectedTerm: string | null
  terms: TermFile[]
  docs: DocFile[]
  projectName: string
  onTermSelect: (termPath: string) => void
  onDocSelect: (docPath: string) => void
}

export function SubPane({ tab, onTabChange, selectedDoc, selectedTerm, terms, docs, projectName, onTermSelect, onDocSelect }: SubPaneProps) {
  const [toc, setToc] = useState<Array<{id: string, text: string, level: number}>>([])
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [tooltip, setTooltip] = useState<{term: TermFile, linkElement: HTMLElement} | null>(null)
  
  const { width, startResize } = useResizable({
    initialWidth: 300,
    minWidth: 200,
    maxWidth: 600,
    storageKey: 'subpane-width'
  })

  useEffect(() => {
    if (selectedDoc && projectName) {
      const loadDoc = async () => {
        try {
          let docs: DocFile[] = []
          
        const { DataLoader } = await import('@/lib/data-loader')
        docs = await DataLoader.getDocFiles(projectName)
          
          const doc = docs.find(d => d.path === selectedDoc)
          if (doc) {
            setDoc(doc)
            const tocData = extractTocFromHtml(doc.html)
            setToc(tocData)
          } else {
            setDoc(null)
            setToc([])
          }
        } catch (err) {
          console.error('Failed to load doc for TOC:', err)
          setDoc(null)
          setToc([])
        }
      }
      
      loadDoc()
    } else {
      setDoc(null)
      setToc([])
    }
  }, [selectedDoc, projectName])

  const handleTocClick = (id: string) => {
    console.log('TOC click:', id)
    
    // まずid属性で検索
    let element = document.getElementById(id)
    
    // id属性で見つからない場合は、見出しテキストで検索
    if (!element) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i]
        const headingText = heading.textContent?.trim() || ''
        const headingId = headingText
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAFa-z0-9\-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        
        if (headingText === id || headingId === id) {
          element = heading as HTMLElement
          break
        }
      }
    }
    
    if (element) {
      console.log('Found element:', element)
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      console.log('Element not found for id:', id)
      // デバッグ用：現在のページの見出しを表示
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      console.log('Available headings:', Array.from(headings).map(h => ({
        text: h.textContent?.trim(),
        id: h.id,
        tagName: h.tagName
      })))
    }
  }

  const handleTermClick = (termPath: string) => {
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
          const term = terms.find(t => t.path === termPath)
          if (term) {
            setTooltip({
              term,
              linkElement: target
            })
          }
        }
      }
    } else {
      // term-link以外にマウスが移動した場合はtooltipを非表示
      setTooltip(null)
    }
  }

  const renderTocItem = (item: {id: string, text: string, level: number}) => {
    const className = `toc-item toc-h${item.level}`
    return (
      <div
        key={item.id}
        className={className}
        onClick={() => handleTocClick(item.id)}
      >
        {item.text}
      </div>
    )
  }

  return (
    <div className="sub-pane" style={{ width: `${width}px` }}>
      <ResizeHandle onMouseDown={startResize} />
      <div style={{ paddingLeft: '4px' }}>
        <div className="tab-container">
        <button
          className={`tab ${tab === 'toc' ? 'active' : ''}`}
          onClick={() => onTabChange('toc')}
        >
          TOC
        </button>
        <button
          className={`tab ${tab === 'preview' ? 'active' : ''}`}
          onClick={() => onTabChange('preview')}
        >
          用語
        </button>
      </div>
      
      <div>
        {tab === 'toc' && (
          <div>
            <h3>目次</h3>
            {toc.length > 0 ? (
              <div className="toc-container">
                {toc.map(renderTocItem)}
              </div>
            ) : (
              <p>目次がありません</p>
            )}
          </div>
        )}
        
        {tab === 'preview' && (
          <div>
            {selectedTerm ? (
              <div>
                {(() => {
                  const term = terms.find(t => t.path === selectedTerm)
                  if (!term) return <p>用語が見つかりません</p>
                  
                  return (
                    <div 
                      className="term-page"
                      onClick={handleContentClick}
                      onMouseMove={handleContentMouseMove}
                    >
                      <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.html, terms, docs, term.title) }} />
                    </div>
                  )
                })()}
              </div>
            ) : (
              <p>用語を選択すると用語ページが表示されます</p>
            )}
          </div>
        )}
        </div>
      </div>
      {tooltip && (
        <TermTooltip
          term={tooltip.term}
          linkElement={tooltip.linkElement}
          onClick={() => handleTermClick(tooltip.term.slug)}
          containerElement={document.querySelector('.sub-pane') as HTMLElement}
        />
      )}
    </div>
  )
}
