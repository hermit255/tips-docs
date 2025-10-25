'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DocFile, TermFile } from '@/types'
import { DataLoader } from '@/lib/data-loader'
import { debounce } from '@/lib/performance'

export function useMarkdownData(projectName: string) {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [terms, setTerms] = useState<TermFile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!projectName) return
    
    try {
      setLoading(true)
      
      const [docsData, termsData] = await Promise.all([
        DataLoader.getDocFiles(projectName),
        DataLoader.getTermFiles(projectName)
      ])
      
      setDocs(docsData)
      setTerms(termsData)
    } catch (error) {
      console.error('Failed to fetch markdown data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectName])

  // デバウンスされたfetchData
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  )

  useEffect(() => {
    debouncedFetchData()
  }, [debouncedFetchData])

  // メモ化された結果
  const memoizedResult = useMemo(() => ({
    docs,
    terms,
    loading
  }), [docs, terms, loading])

  return memoizedResult
}
