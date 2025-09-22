'use client'

import { useState, useEffect } from 'react'
import { WikiLayout } from '@/components/WikiLayout'
import { MenuPane } from '@/components/MenuPane'
import { ContentPane } from '@/components/ContentPane'
import { SubPane } from '@/components/SubPane'
import { useMarkdownData } from '@/hooks/useMarkdownData'
import { useProjects } from '@/hooks/useProjects'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [subPaneTab, setSubPaneTab] = useState<'toc' | 'preview'>('toc')
  
  const { projects, loading: projectsLoading } = useProjects()
  const { docs, terms, loading } = useMarkdownData(selectedProject)

  const handleDocSelect = (docPath: string) => {
    setSelectedDoc(docPath)
    setSelectedTerm(null)
    setSubPaneTab('toc')
  }

  const handleTermSelect = (termSlug: string) => {
    setSelectedTerm(termSlug)
    // ドキュメント選択はクリアしない（コンテンツペインの状態を保持）
    setSubPaneTab('preview') // サブペインをプレビュータブに切り替え
  }

  const handleTermSelectFromMenu = (termSlug: string) => {
    setSelectedTerm(termSlug)
    setSelectedDoc(null) // メニューから選択した場合はドキュメント選択をクリア
    setSubPaneTab('preview') // サブペインをプレビュータブに切り替え
  }

  const handleProjectSelect = (projectName: string) => {
    setSelectedProject(projectName)
    setSelectedDoc(null) // プロジェクト変更時は選択をクリア
    setSelectedTerm(null)
    setSubPaneTab('toc')
  }

  // プロジェクトが選択されていない場合はプロジェクト選択画面を表示
  if (!selectedProject) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>プロジェクトを選択してください</h1>
        {projectsLoading ? (
          <div>読み込み中...</div>
        ) : (
          <select 
            value={selectedProject} 
            onChange={(e) => handleProjectSelect(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              minWidth: '200px'
            }}
          >
            <option value="">プロジェクトを選択</option>
            {projects.map(project => (
              <option key={project.name} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <WikiLayout>
      <MenuPane 
        docs={docs}
        terms={terms}
        onDocSelect={handleDocSelect}
        onTermSelect={handleTermSelectFromMenu}
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        selectedProject={selectedProject}
        projects={projects}
        onProjectSelect={handleProjectSelect}
      />
      <ContentPane 
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        terms={terms}
        docs={docs}
        projectName={selectedProject}
        onTermSelect={handleTermSelect}
        onDocSelect={handleDocSelect}
      />
      <SubPane 
        tab={subPaneTab}
        onTabChange={setSubPaneTab}
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        terms={terms}
        projectName={selectedProject}
      />
    </WikiLayout>
  )
}
