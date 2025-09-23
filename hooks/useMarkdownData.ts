'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocFile, TermFile } from '@/lib/markdown-client'
import { useFileWatcher } from './useFileWatcher'

export function useMarkdownData(projectName: string) {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [terms, setTerms] = useState<TermFile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!projectName) return
    
    try {
      setLoading(true)
      const [docsResponse, termsResponse] = await Promise.all([
        fetch(`/api/${encodeURIComponent(projectName)}-docs.json`),
        fetch(`/api/${encodeURIComponent(projectName)}-terms.json`)
      ])
      
      const docsData = await docsResponse.json()
      const termsData = await termsResponse.json()
      
      setDocs(docsData)
      setTerms(termsData)
    } catch (error) {
      console.error('Failed to fetch markdown data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ファイル変更を監視してデータを再取得
  useFileWatcher(fetchData)

  return { docs, terms, loading }
}
