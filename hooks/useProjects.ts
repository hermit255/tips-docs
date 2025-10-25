'use client'

import { useState, useEffect } from 'react'
import { getProjects } from '@/lib/markdown-client-static'

export interface Project {
  name: string
  path: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        // 静的データを読み込み
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return { projects, loading }
}
