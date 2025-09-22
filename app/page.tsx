'use client'

import { useState, useEffect } from 'react'
import { WikiLayout } from '@/components/WikiLayout'
import { MenuPane } from '@/components/MenuPane'
import { ContentPane } from '@/components/ContentPane'
import { SubPane } from '@/components/SubPane'
import { useMarkdownData } from '@/hooks/useMarkdownData'

export default function Home() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [subPaneTab, setSubPaneTab] = useState<'toc' | 'preview'>('toc')
  
  const { docs, terms, loading } = useMarkdownData()

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

  return (
    <WikiLayout>
      <MenuPane 
        docs={docs}
        terms={terms}
        onDocSelect={handleDocSelect}
        onTermSelect={handleTermSelectFromMenu}
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
      />
      <ContentPane 
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        terms={terms}
        onTermSelect={handleTermSelect}
      />
      <SubPane 
        tab={subPaneTab}
        onTabChange={setSubPaneTab}
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        terms={terms}
      />
    </WikiLayout>
  )
}
