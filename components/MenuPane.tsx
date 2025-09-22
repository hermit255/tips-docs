'use client'

import { useState } from 'react'
import { DocFile, TermFile, MenuItem, buildMenuStructure } from '@/lib/markdown-client'

interface MenuPaneProps {
  docs: DocFile[]
  terms: TermFile[]
  onDocSelect: (docPath: string) => void
  onTermSelect: (termSlug: string) => void
  selectedDoc: string | null
  selectedTerm: string | null
}

export function MenuPane({ docs, terms, onDocSelect, onTermSelect, selectedDoc, selectedTerm }: MenuPaneProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'terms'>('docs')
  
  const menuStructure = buildMenuStructure(docs)

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isSelected = selectedDoc === item.path
    const indentStyle = { paddingLeft: `${level * 20}px` }
    
    return (
      <div key={item.path}>
        <div
          className={`menu-item ${isSelected ? 'selected' : ''}`}
          style={indentStyle}
          onClick={() => item.type === 'file' && onDocSelect(item.path)}
        >
          {item.type === 'folder' ? (
            <span className="menu-folder">📁 {item.name}</span>
          ) : (
            <span className="menu-file">📄 {item.name}</span>
          )}
        </div>
        {item.children && item.children.map(child => renderMenuItem(child, level + 1))}
      </div>
    )
  }

  const renderTermItem = (term: TermFile) => {
    const isSelected = selectedTerm === term.slug
    
    return (
      <div
        key={term.slug}
        className={`menu-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onTermSelect(term.slug)}
      >
        <span className="menu-file">📖 {term.title}</span>
      </div>
    )
  }

  return (
    <div className="menu-pane">
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          ドキュメント
        </button>
        <button
          className={`tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          用語
        </button>
      </div>
      
      <div>
        {activeTab === 'docs' && (
          <div>
            <h3>ドキュメント一覧</h3>
            {menuStructure.map(item => renderMenuItem(item))}
          </div>
        )}
        {activeTab === 'terms' && (
          <div>
            <h3>用語一覧</h3>
            {terms.length > 0 ? (
              <div>
                {terms.map(renderTermItem)}
              </div>
            ) : (
              <p>用語がありません</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
