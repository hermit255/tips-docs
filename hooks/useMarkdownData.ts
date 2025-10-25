'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocFile, TermFile } from '@/lib/markdown-client'
import { getDocFiles, getTermFiles } from '@/lib/markdown-client-static'

export function useMarkdownData(projectName: string) {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [terms, setTerms] = useState<TermFile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!projectName) return
    
    try {
      setLoading(true)
      // 静的データを読み込み
      const [docsData, termsData] = await Promise.all([
        getDocFiles(projectName),
        getTermFiles(projectName)
      ])
      
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

  return { docs, terms, loading }
}
