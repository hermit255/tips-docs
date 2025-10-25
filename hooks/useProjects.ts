'use client'

import { useState, useEffect, useMemo } from 'react'
import { Project } from '@/types'
import { DataLoader } from '@/lib/data-loader'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const projects = await DataLoader.getProjects()
        setProjects(projects)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])

  // メモ化された結果
  const memoizedResult = useMemo(() => ({
    projects,
    loading
  }), [projects, loading])

  return memoizedResult
}
