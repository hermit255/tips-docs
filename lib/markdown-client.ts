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

// 特殊リンク例外ルールの型定義
export interface LinkExceptionRule {
  id: string
  name: string
  description: string
  enabled: boolean
  type: 'self-reference' | 'kanji-context' | 'custom'
  config?: {
    // カスタムルール用の設定
    pattern?: string
    flags?: string
  }
}

// 特殊リンク設定
export interface LinkSettings {
  rules: LinkExceptionRule[]
}

// デフォルトの例外ルール
export const DEFAULT_LINK_EXCEPTION_RULES: LinkExceptionRule[] = [
  {
    id: 'self-reference',
    name: '自ファイル名参照',
    description: '自mdファイル名に該当する場合は特殊リンクを設定しない',
    enabled: true,
    type: 'self-reference'
  },
  {
    id: 'kanji-context',
    name: '漢字コンテキスト',
    description: '該当するワードの前後どちらかに漢字がある場合は特殊リンクを設定しない',
    enabled: true,
    type: 'kanji-context'
  }
]

// 例外ルールの判定関数
export function shouldSkipLink(
  match: string,
  fullText: string,
  matchIndex: number,
  currentFileName: string,
  rules: LinkExceptionRule[]
): boolean {
  const enabledRules = rules.filter(rule => rule.enabled)
  
  for (const rule of enabledRules) {
    switch (rule.type) {
      case 'self-reference':
        if (match === currentFileName) {
          return true
        }
        break
        
      case 'kanji-context':
        if (hasKanjiContext(fullText, matchIndex, match.length)) {
          return true
        }
        break
        
      case 'custom':
        if (rule.config?.pattern) {
          try {
            const regex = new RegExp(rule.config.pattern, rule.config.flags || 'g')
            if (regex.test(match)) {
              return true
            }
          } catch (error) {
            console.warn(`Invalid custom rule pattern: ${rule.config.pattern}`, error)
          }
        }
        break
    }
  }
  
  return false
}

// 漢字コンテキストの判定
function hasKanjiContext(text: string, matchIndex: number, matchLength: number): boolean {
  const beforeChar = text[matchIndex - 1]
  const afterChar = text[matchIndex + matchLength]
  
  // 前後に漢字があるかチェック
  const hasKanjiBefore = typeof beforeChar === 'string' && isKanji(beforeChar)
  const hasKanjiAfter = typeof afterChar === 'string' && isKanji(afterChar)
  
  return hasKanjiBefore || hasKanjiAfter
}

// 漢字判定関数
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0)
  return (
    (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
    (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
    (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
    (code >= 0x2B820 && code <= 0x2CEAF) || // CJK Extension E
    (code >= 0x2CEB0 && code <= 0x2EBEF) || // CJK Extension F
    (code >= 0x30000 && code <= 0x3134F)    // CJK Extension G
  )
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

export function processContentWithLinks(
  html: string, 
  terms: TermFile[], 
  docs: DocFile[], 
  currentFileName: string = '',
  exceptionRules: LinkExceptionRule[] = DEFAULT_LINK_EXCEPTION_RULES
): string {
  let processedHtml = html
  
  // 用語ファイル名と一致するテキストを特殊リンクAに変換
  terms.forEach(term => {
    const termName = term.title
    // ##で囲まれたテキストは除外
    const regex = new RegExp(`(?<!##)${termName}(?!##)`, 'g')
    processedHtml = processedHtml.replace(regex, (match, offset) => {
      // 例外ルールをチェック
      if (shouldSkipLink(match, processedHtml, offset, currentFileName, exceptionRules)) {
        return match // リンク化しない
      }
      return `<span class="term-link" data-term="${term.slug}">${match}</span>`
    })
  })
  
  // ドキュメントファイル名と一致するテキストを特殊リンクBに変換
  docs.forEach(doc => {
    const docName = doc.title
    // ##で囲まれたテキストは除外
    const regex = new RegExp(`(?<!##)${docName}(?!##)`, 'g')
    processedHtml = processedHtml.replace(regex, (match, offset) => {
      // 例外ルールをチェック
      if (shouldSkipLink(match, processedHtml, offset, currentFileName, exceptionRules)) {
        return match // リンク化しない
      }
      return `<span class="doc-link" data-doc="${doc.path}">${match}</span>`
    })
  })
  
  return processedHtml
}
