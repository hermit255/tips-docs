// 共通の型定義

export interface DocFile {
  slug: string
  title: string
  content: string
  html: string
  path: string
}

export interface TermFile {
  slug: string
  title: string
  content: string
  html: string
  path: string
  summary?: string
  description?: string
  synonyms?: string[]
  antonyms?: string[]
  siblings?: string[]
  parents?: string[]
  children?: string[]
}

export interface Project {
  name: string
  path: string
}

export interface ProjectData {
  docs: DocFile[]
  terms: TermFile[]
}

export interface StaticData {
  projects: Project[]
  projectData: Record<string, ProjectData>
}

export interface MenuItem {
  title: string
  path: string
  type: 'doc' | 'term'
  name?: string
  children?: MenuItem[]
}

export interface LinkExceptionRule {
  id?: string
  name?: string
  pattern?: RegExp
  description: string
  enabled?: boolean
  type?: string
  config?: any
}

export interface LinkSettings {
  enabled: boolean
  rules: LinkExceptionRule[]
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface TooltipData {
  term: TermFile
  x: number
  y: number
}
