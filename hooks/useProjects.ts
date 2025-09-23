'use client'

import { useState, useEffect } from 'react'

export interface Project {
  name: string
  path: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects.json')
        const data = await response.json()
        setProjects(data.map((name: string) => ({ name, path: name })))
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading }
}
