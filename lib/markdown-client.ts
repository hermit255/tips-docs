// クライアントサイド用の型定義とユーティリティ関数

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

export interface MenuItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: MenuItem[]
}

export function buildMenuStructure(docs: DocFile[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>()
  const rootItems: MenuItem[] = []
  
  for (const doc of docs) {
    const pathParts = doc.path.split('/')
    let currentPath = ''
    let parentItems = rootItems
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (!menuMap.has(currentPath)) {
        const isFile = i === pathParts.length - 1
        const menuItem: MenuItem = {
          name: part.replace(/\.md$/, ''),
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : []
        }
        
        menuMap.set(currentPath, menuItem)
        parentItems.push(menuItem)
      }
      
      const currentItem = menuMap.get(currentPath)!
      if (currentItem.children) {
        parentItems = currentItem.children
      }
    }
  }
  
  return rootItems
}

export function extractTocFromHtml(html: string): Array<{id: string, text: string, level: number}> {
  const toc: Array<{id: string, text: string, level: number}> = []
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g
  
  let match
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].replace(/<[^>]*>/g, '') // HTMLタグを除去
    
    toc.push({ id, text, level })
  }
  
  return toc
}
