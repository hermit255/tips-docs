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
        let projects: Project[] = []
        
        if (typeof window !== 'undefined' && window.location.pathname.includes('/tips-docs')) {
          // GitHub Pages環境では静的データを使用
          projects = await getProjects()
        } else {
          // ローカル環境ではAPIルートを使用
          const response = await fetch('/api/projects')
          if (response.ok) {
            projects = await response.json()
          } else {
            throw new Error('Failed to fetch projects from API')
          }
        }
        
        setProjects(projects)
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
