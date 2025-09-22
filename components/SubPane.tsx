'use client'

import { useState, useEffect } from 'react'
import { DocFile, TermFile, extractTocFromHtml } from '@/lib/markdown-client'

interface SubPaneProps {
  tab: 'toc' | 'preview'
  onTabChange: (tab: 'toc' | 'preview') => void
  selectedDoc: string | null
  selectedTerm: string | null
  terms: TermFile[]
  projectName: string
}

export function SubPane({ tab, onTabChange, selectedDoc, selectedTerm, terms, projectName }: SubPaneProps) {
  const [toc, setToc] = useState<Array<{id: string, text: string, level: number}>>([])
  const [doc, setDoc] = useState<DocFile | null>(null)

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
          用語
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
            <h3>用語ページ</h3>
            {selectedTerm ? (
              <div>
                {(() => {
                  const term = terms.find(t => t.slug === selectedTerm)
                  if (!term) return <p>用語が見つかりません</p>
                  
                  return (
                    <div className="term-page">
                      <h1>{term.title}</h1>
                      
                      {term.summary && (
                        <section>
                          <h2>概要</h2>
                          <div dangerouslySetInnerHTML={{ __html: term.summary }} />
                        </section>
                      )}
                      
                      {term.description && (
                        <section>
                          <h2>詳細</h2>
                          <div dangerouslySetInnerHTML={{ __html: term.description }} />
                        </section>
                      )}
                      
                      {term.synonyms && term.synonyms.length > 0 && (
                        <section>
                          <h2>類義語</h2>
                          <ul>
                            {term.synonyms.map((synonym, index) => (
                              <li key={index}>{synonym}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                      
                      {term.antonyms && term.antonyms.length > 0 && (
                        <section>
                          <h2>対義語</h2>
                          <ul>
                            {term.antonyms.map((antonym, index) => (
                              <li key={index}>{antonym}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                      
                      {(term.siblings && term.siblings.length > 0) || 
                       (term.parents && term.parents.length > 0) || 
                       (term.children && term.children.length > 0) ? (
                        <section>
                          <h2>兄弟・親・子</h2>
                          {term.siblings && term.siblings.length > 0 && (
                            <div>
                              <h3>兄弟</h3>
                              <ul>
                                {term.siblings.map((sibling, index) => (
                                  <li key={index}>{sibling}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {term.parents && term.parents.length > 0 && (
                            <div>
                              <h3>親</h3>
                              <ul>
                                {term.parents.map((parent, index) => (
                                  <li key={index}>{parent}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {term.children && term.children.length > 0 && (
                            <div>
                              <h3>子</h3>
                              <ul>
                                {term.children.map((child, index) => (
                                  <li key={index}>{child}</li>
                                ))}
                              </ul>
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
  )
}
