'use client'

import { useState } from 'react'
import { DocFile, TermFile, MenuItem, buildMenuStructure, buildTermMenuStructure } from '@/lib/markdown-client'

interface Project {
  name: string
  path: string
}

interface MenuPaneProps {
  docs: DocFile[]
  terms: TermFile[]
  onDocSelect: (docPath: string) => void
  onTermSelect: (termSlug: string) => void
  selectedDoc: string | null
  selectedTerm: string | null
  selectedProject: string
  projects: Project[]
  onProjectSelect: (projectName: string) => void
}

export function MenuPane({ docs, terms, onDocSelect, onTermSelect, selectedDoc, selectedTerm, selectedProject, projects, onProjectSelect }: MenuPaneProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'terms'>('docs')
  
  const menuStructure = buildMenuStructure(docs)
  const termMenuStructure = buildTermMenuStructure(terms)

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isSelected = selectedDoc === item.path
    const indentStyle = { paddingLeft: `${level * 20}px` }
    
    return (
      <div key={item.path}>
        <div
          className={`menu-item ${isSelected ? 'selected' : ''}`}
          style={indentStyle}
          onClick={() => {
            if (item.type === 'file') {
              console.log('MenuPane: Clicking doc with path:', item.path)
              console.log('MenuPane: Item details:', { name: item.name, path: item.path, type: item.type })
              onDocSelect(item.path)
            }
          }}
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

  const renderTermMenuItem = (item: MenuItem, level: number = 0) => {
    const isSelected = selectedTerm === item.path
    const indentStyle = { paddingLeft: `${level * 20}px` }
    
    return (
      <div key={item.path}>
        <div
          className={`menu-item ${isSelected ? 'selected' : ''}`}
          style={indentStyle}
          onClick={() => {
            if (item.type === 'file') {
              console.log('MenuPane: Clicking term with path:', item.path)
              console.log('MenuPane: Term item details:', { name: item.name, path: item.path, type: item.type })
              onTermSelect(item.path)
            }
          }}
        >
          {item.type === 'folder' ? (
            <span className="menu-folder">📁 {item.name}</span>
          ) : (
            <span className="menu-file">📖 {item.name}</span>
          )}
        </div>
        {item.children && item.children.map(child => renderTermMenuItem(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="menu-pane">
      <div style={{ 
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>プロジェクト:</span>
          <select 
            value={selectedProject} 
            onChange={(e) => onProjectSelect(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {projects.map(project => (
              <option key={project.name} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
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
            {termMenuStructure.length > 0 ? (
              <div>
                {termMenuStructure.map(item => renderTermMenuItem(item))}
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
