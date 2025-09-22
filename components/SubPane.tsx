'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile, extractTocFromHtml } from '@/lib/markdown-client'

interface SubPaneProps {
  tab: 'toc' | 'preview'
  onTabChange: (tab: 'toc' | 'preview') => void
  selectedDoc: string | null
  selectedTerm: string | null
  terms: TermFile[]
}

export function SubPane({ tab, onTabChange, selectedDoc, selectedTerm, terms }: SubPaneProps) {
  const [toc, setToc] = useState<Array<{id: string, text: string, level: number}>>([])
  const [doc, setDoc] = useState<DocFile | null>(null)

  useEffect(() => {
    if (selectedDoc) {
      fetch(`/api/docs/${selectedDoc}`)
        .then(res => res.json())
        .then((data: DocFile) => {
          setDoc(data)
          const tocData = extractTocFromHtml(data.html)
          setToc(tocData)
        })
        .catch(err => console.error('Failed to fetch doc for TOC:', err))
    } else {
      setDoc(null)
      setToc([])
    }
  }, [selectedDoc])

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
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
    <div className="sub-pane">
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
          プレビュー
        </button>
      </div>
      
      <div>
        {tab === 'toc' && (
          <div>
            <h3>目次</h3>
            {toc.length > 0 ? (
              <div>
                {toc.map(renderTocItem)}
              </div>
            ) : (
              <p>目次がありません</p>
            )}
          </div>
        )}
        
        {tab === 'preview' && (
          <div>
            <h3>リンクページプレビュー</h3>
            {selectedTerm ? (
              <div>
                <h4>選択中の用語</h4>
                <p>用語の詳細プレビュー機能は実装中です</p>
              </div>
            ) : (
              <p>用語を選択するとプレビューが表示されます</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
