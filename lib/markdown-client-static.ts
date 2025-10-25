// クライアントサイド用の静的データ読み込み関数

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
}

export interface Project {
  name: string
  path: string
}

interface ProjectData {
  docs: DocFile[]
  terms: TermFile[]
}

interface StaticData {
  projects: Project[]
  projectData: Record<string, ProjectData>
}

let cachedData: StaticData | null = null

// 静的データを読み込み
async function loadStaticData(): Promise<StaticData> {
  if (cachedData) {
    return cachedData
  }
  
  try {
    // 環境に応じてデータソースを決定
    let dataUrl = ''
    if (typeof window !== 'undefined') {
      // ブラウザ環境では、URLパスから判定
      if (window.location.pathname.includes('/tips-docs')) {
        // GitHub Pages環境
        dataUrl = '/tips-docs/data/projects.json'
      } else {
        // ローカル環境ではAPIルートを使用
        dataUrl = '/api/projects'
      }
    } else {
      // サーバー環境では、環境変数から判定
      if (process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS) {
        dataUrl = '/tips-docs/data/projects.json'
      } else {
        dataUrl = '/api/projects'
      }
    }
    
    const response = await fetch(dataUrl)
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`)
    }
    cachedData = await response.json()
    return cachedData!
  } catch (error) {
    console.error('Failed to load static data:', error)
    return {
      projects: [],
      projectData: {}
    }
  }
}

// プロジェクト一覧を取得
export async function getProjects(): Promise<Project[]> {
  const data = await loadStaticData()
  return data.projects
}

// プロジェクトのドキュメント一覧を取得
export async function getDocFiles(projectName: string): Promise<DocFile[]> {
  const data = await loadStaticData()
  return data.projectData[projectName]?.docs || []
}

// プロジェクトの用語一覧を取得
export async function getTermFiles(projectName: string): Promise<TermFile[]> {
  const data = await loadStaticData()
  return data.projectData[projectName]?.terms || []
}

// 特定のドキュメントを取得
export async function getDoc(projectName: string, docPath: string): Promise<DocFile | null> {
  const docs = await getDocFiles(projectName)
  return docs.find(doc => doc.path === docPath) || null
}

// 特定の用語を取得
export async function getTerm(projectName: string, termPath: string): Promise<TermFile | null> {
  const terms = await getTermFiles(projectName)
  return terms.find(term => term.path === termPath) || null
}
