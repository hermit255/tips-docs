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
      
      // 環境に応じてデータソースを決定
      let docsData: DocFile[] = []
      let termsData: TermFile[] = []
      
      if (typeof window !== 'undefined' && window.location.pathname.includes('/tips-docs')) {
        // GitHub Pages環境では静的データを使用
        const [docsResult, termsResult] = await Promise.all([
          getDocFiles(projectName),
          getTermFiles(projectName)
        ])
        docsData = docsResult
        termsData = termsResult
      } else {
        // ローカル環境ではAPIルートを使用
        const [docsResponse, termsResponse] = await Promise.all([
          fetch(`/api/docs?project=${encodeURIComponent(projectName)}`),
          fetch(`/api/terms?project=${encodeURIComponent(projectName)}`)
        ])
        
        if (docsResponse.ok && termsResponse.ok) {
          docsData = await docsResponse.json()
          termsData = await termsResponse.json()
        } else {
          throw new Error('Failed to fetch data from API')
        }
      }
      
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
