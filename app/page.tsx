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

  return (
    <WikiLayout>
      <MenuPane 
        docs={docs}
        onDocSelect={setSelectedDoc}
        selectedDoc={selectedDoc}
      />
      <ContentPane 
        selectedDoc={selectedDoc}
        selectedTerm={selectedTerm}
        terms={terms}
        onTermSelect={setSelectedTerm}
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
