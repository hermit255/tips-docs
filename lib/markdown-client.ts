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
  
  // デバッグ用ログ
  console.log('Extracting TOC from HTML:', html.substring(0, 500) + '...')
  
  // id属性がある見出しを優先して検索
  const headingWithIdRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/gi
  let match
  while ((match = headingWithIdRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].replace(/<[^>]*>/g, '') // HTMLタグを除去
    
    toc.push({ id, text, level })
  }
  
  // id属性がない場合は、見出しテキストからidを生成
  if (toc.length === 0) {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, '') // HTMLタグを除去
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
      
      toc.push({ id, text, level })
    }
  }
  
  console.log('Generated TOC:', toc)
  return toc
}

export function processContentWithLinks(html: string, terms: TermFile[], docs: DocFile[]): string {
  let processedHtml = html
  
  // 用語ファイル名と一致するテキストを特殊リンクAに変換
  terms.forEach(term => {
    const termName = term.title
    // ##で囲まれたテキストは除外
    const regex = new RegExp(`(?<!##)${termName}(?!##)`, 'g')
    processedHtml = processedHtml.replace(regex, (match) => {
      return `<span class="term-link" data-term="${term.slug}">${match}</span>`
    })
  })
  
  // ドキュメントファイル名と一致するテキストを特殊リンクBに変換
  docs.forEach(doc => {
    const docName = doc.title
    // ##で囲まれたテキストは除外
    const regex = new RegExp(`(?<!##)${docName}(?!##)`, 'g')
    processedHtml = processedHtml.replace(regex, (match) => {
      return `<span class="doc-link" data-doc="${doc.path}">${match}</span>`
    })
  })
  
  return processedHtml
}
