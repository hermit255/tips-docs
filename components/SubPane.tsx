'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile, extractTocFromHtml, processContentWithLinks } from '@/lib/markdown-client'
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
  onTermSelect: (termSlug: string) => void
  onDocSelect: (docPath: string) => void
}

export function SubPane({ tab, onTabChange, selectedDoc, selectedTerm, terms, docs, projectName, onTermSelect, onDocSelect }: SubPaneProps) {
  const [toc, setToc] = useState<Array<{id: string, text: string, level: number}>>([])
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [tooltip, setTooltip] = useState<{term: TermFile, x: number, y: number} | null>(null)
  
  const { width, startResize } = useResizable({
    initialWidth: 300,
    minWidth: 200,
    maxWidth: 600,
    storageKey: 'subpane-width'
  })

  useEffect(() => {
    if (selectedDoc && projectName) {
      fetch(`/api/docs/${selectedDoc}?project=${encodeURIComponent(projectName)}`)
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
  }, [selectedDoc, projectName])

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleTermClick = (termSlug: string) => {
    onTermSelect(termSlug)
    setTooltip(null)
  }

  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termSlug = target.getAttribute('data-term')
      if (termSlug) {
        handleTermClick(termSlug)
      }
    } else if (target.classList.contains('doc-link')) {
      const docPath = target.getAttribute('data-doc')
      if (docPath) {
        onDocSelect(docPath)
      }
    }
  }

  const handleContentMouseMove = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('term-link')) {
      const termSlug = target.getAttribute('data-term')
      if (termSlug) {
        const term = terms.find(t => t.slug === termSlug)
        if (term) {
          setTooltip({
            term,
            x: event.clientX,
            y: event.clientY
          })
        }
      }
    } else {
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
                  const term = terms.find(t => t.slug === selectedTerm)
                  if (!term) return <p>用語が見つかりません</p>
                  
                  return (
                    <div 
                      className="term-page"
                      onClick={handleContentClick}
                      onMouseMove={handleContentMouseMove}
                    >
                      <h1>{term.title}</h1>
                      
                      {term.summary && (
                        <section>
                          <h3>概要</h3>
                          <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.summary, terms, docs, term.title) }} />
                        </section>
                      )}
                      
                      {term.description && (
                        <section>
                          <h3>詳細</h3>
                          <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.description, terms, docs, term.title) }} />
                        </section>
                      )}
                      
                      {term.synonyms && term.synonyms.length > 0 && (
                        <section>
                          <h3>類義語</h3>
                          <ul>
                            {term.synonyms.map((synonym, index) => (
                              <li key={index} dangerouslySetInnerHTML={{ __html: processContentWithLinks(synonym, terms, docs, term.title) }} />
                            ))}
                          </ul>
                        </section>
                      )}
                      
                      {term.antonyms && term.antonyms.length > 0 && (
                        <section>
                          <h3>対義語</h3>
                          <ul>
                            {term.antonyms.map((antonym, index) => (
                              <li key={index} dangerouslySetInnerHTML={{ __html: processContentWithLinks(antonym, terms, docs, term.title) }} />
                            ))}
                          </ul>
                        </section>
                      )}
                      
                      {(term.siblings && term.siblings.length > 0) || 
                       (term.parents && term.parents.length > 0) || 
                       (term.children && term.children.length > 0) ? (
                        <section>
                          {term.siblings && term.siblings.length > 0 && (
                            <div>
                              <h3>兄弟</h3>
                              {term.siblings.length === 1 ? (
                                <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.siblings[0], terms, docs, term.title) }} />
                              ) : (
                                <ul>
                                  {term.siblings.map((sibling, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: processContentWithLinks(sibling, terms, docs, term.title) }} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                          {term.parents && term.parents.length > 0 && (
                            <div>
                              <h3>親</h3>
                              {term.parents.length === 1 ? (
                                <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.parents[0], terms, docs, term.title) }} />
                              ) : (
                                <ul>
                                  {term.parents.map((parent, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: processContentWithLinks(parent, terms, docs, term.title) }} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                          {term.children && term.children.length > 0 && (
                            <div>
                              <h3>子</h3>
                              {term.children.length === 1 ? (
                                <div dangerouslySetInnerHTML={{ __html: processContentWithLinks(term.children[0], terms, docs, term.title) }} />
                              ) : (
                                <ul>
                                  {term.children.map((child, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: processContentWithLinks(child, terms, docs, term.title) }} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </section>
                      ) : null}
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
          x={tooltip.x}
          y={tooltip.y}
          onClick={() => handleTermClick(tooltip.term.slug)}
        />
      )}
    </div>
  )
}
