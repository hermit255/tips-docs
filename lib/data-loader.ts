// 共通のデータ読み込み処理

import { DocFile, TermFile, Project, StaticData } from '@/types'
import { logError, withErrorHandling, NetworkError, NotFoundError } from './error-handler'

/**
 * 環境に応じて適切なデータソースからデータを読み込む
 */
export class DataLoader {
  private static cachedData: StaticData | null = null

  /**
   * 現在の環境を判定する
   */
  private static isGitHubPages(): boolean {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV === 'production' && !!process.env.GITHUB_ACTIONS
    }
    return window.location.pathname.includes('/tips-docs')
  }

  /**
   * 静的データを読み込む
   */
  private static async loadStaticData(): Promise<StaticData> {
    if (this.cachedData) {
      return this.cachedData
    }

    return await withErrorHandling(async () => {
      const basePath = this.isGitHubPages() ? '/tips-docs' : ''
      const response = await fetch(`${basePath}/data/projects.json`)
      
      if (!response.ok) {
        throw new NetworkError(`Failed to load data: ${response.status}`)
      }
      
      this.cachedData = await response.json()
      return this.cachedData
    }, 'loadStaticData') || {
      projects: [],
      projectData: {}
    }
  }

  /**
   * APIルートからデータを読み込む
   */
  private static async loadFromAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : '')
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(`Resource not found: ${endpoint}`)
      }
      throw new NetworkError(`Failed to fetch from ${endpoint}: ${response.status}`)
    }
    
    return response.json()
  }

  /**
   * プロジェクト一覧を取得
   */
  static async getProjects(): Promise<Project[]> {
    return await withErrorHandling(async () => {
      if (this.isGitHubPages()) {
        const data = await this.loadStaticData()
        return data.projects
      } else {
        return await this.loadFromAPI<Project[]>('/api/projects')
      }
    }, 'getProjects') || []
  }

  /**
   * プロジェクトのドキュメント一覧を取得
   */
  static async getDocFiles(projectName: string): Promise<DocFile[]> {
    return await withErrorHandling(async () => {
      if (this.isGitHubPages()) {
        const data = await this.loadStaticData()
        return data.projectData[projectName]?.docs || []
      } else {
        return await this.loadFromAPI<DocFile[]>('/api/docs', { project: projectName })
      }
    }, 'getDocFiles') || []
  }

  /**
   * プロジェクトの用語一覧を取得
   */
  static async getTermFiles(projectName: string): Promise<TermFile[]> {
    return await withErrorHandling(async () => {
      if (this.isGitHubPages()) {
        const data = await this.loadStaticData()
        return data.projectData[projectName]?.terms || []
      } else {
        return await this.loadFromAPI<TermFile[]>('/api/terms', { project: projectName })
      }
    }, 'getTermFiles') || []
  }

  /**
   * 特定のドキュメントを取得
   */
  static async getDoc(projectName: string, docPath: string): Promise<DocFile | null> {
    return await withErrorHandling(async () => {
      const docs = await this.getDocFiles(projectName)
      return docs.find(doc => doc.path === docPath) || null
    }, 'getDoc') || null
  }

  /**
   * 特定の用語を取得
   */
  static async getTerm(projectName: string, termPath: string): Promise<TermFile | null> {
    return await withErrorHandling(async () => {
      const terms = await this.getTermFiles(projectName)
      return terms.find(term => term.path === termPath) || null
    }, 'getTerm') || null
  }

  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.cachedData = null
  }
}
