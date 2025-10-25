import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkBreaks from 'remark-breaks'

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

// 改行処理を改善する関数
function preprocessMarkdown(content: string): string {
  // 改行処理のオプションを提供
  // オプション1: 単一改行を段落区切りに変換
  // オプション2: 単一改行を<br>タグとして保持（remark-breaksで処理）
  
  // 現在はオプション2を採用（remark-breaksに任せる）
  // 必要に応じてオプション1に切り替え可能
  return content
    .replace(/\r\n/g, '\n') // Windows改行を統一
    .replace(/\r/g, '\n')   // Mac改行を統一
    .replace(/\n{3,}/g, '\n\n') // 3つ以上の連続改行を2つに統一
    .replace(/^#\s+.+$/gm, '') // h1タグを除去（重複防止のため）
}

export async function getDocFiles(projectName: string = 'default'): Promise<DocFile[]> {
  const docsDirectory = path.join(process.cwd(), 'projects', projectName, 'docs')
  const fileNames = getAllMarkdownFiles(docsDirectory)
  const docs = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(docsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      // 改行処理を事前に実行
      const preprocessedContent = preprocessMarkdown(content)
      
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkSlug as any)
        .use(remarkBreaks)
        .use(remarkHtml, { sanitize: false })
        .process(preprocessedContent)
      
      const html = processedContent.toString()
      
      // h1タグからタイトルを抽出する関数
      const extractH1Title = (content: string): string | null => {
        const h1Match = content.match(/^#\s+(.+)$/m)
        return h1Match ? h1Match[1].trim() : null
      }
      
      const h1Title = extractH1Title(content)
      const title = h1Title || '名無し'
      
      return {
        slug: fileName.replace(/\.md$/, ''),
        title,
        content,
        html,
        path: fileName
      }
    })
  )
  
  return docs
}

export async function getTermFiles(projectName: string = 'default'): Promise<TermFile[]> {
  const termsDirectory = path.join(process.cwd(), 'projects', projectName, 'terms')
  const fileNames = getAllMarkdownFiles(termsDirectory)
  const terms = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(termsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      // 改行処理を事前に実行
      const preprocessedContent = preprocessMarkdown(content)
      
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkSlug as any)
        .use(remarkBreaks)
        .use(remarkHtml, { sanitize: false })
        .process(preprocessedContent)
      
      const html = processedContent.toString()
      
      // h1タグからタイトルを抽出する関数
      const extractH1Title = (content: string): string | null => {
        const h1Match = content.match(/^#\s+(.+)$/m)
        return h1Match ? h1Match[1].trim() : null
      }
      
      const h1Title = extractH1Title(content)
      const title = h1Title || '名無し'
      
      // 用語ファイルの構造化データを抽出
      const sections = await parseTermSections(content)
      
      return {
        slug: fileName.replace(/\.md$/, ''),
        title,
        content,
        html,
        path: fileName,
        ...sections
      }
    })
  )
  
  return terms
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  
  function traverse(currentDir: string, relativePath: string = '') {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const itemRelativePath = path.join(relativePath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        traverse(fullPath, itemRelativePath)
      } else if (item.endsWith('.md')) {
        files.push(itemRelativePath)
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir)
  }
  
  return files
}

async function parseTermSections(content: string) {
  const sections: any = {}
  const lines = content.split('\n')
  
  let currentSection = ''
  let currentContent: string[] = []
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // 前のセクションを保存
      if (currentSection && currentContent.length > 0) {
        const sectionContent = currentContent.join('\n').trim()
        // markdownとして処理
        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkSlug as any)
          .use(remarkBreaks)
          .use(remarkHtml, { sanitize: false })
          .process(preprocessMarkdown(sectionContent))
        
        sections[currentSection] = processedContent.toString()
      }
      
      // 新しいセクションを開始
      const sectionName = line.replace('## ', '').toLowerCase()
      currentSection = sectionName
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }
  
  // 最後のセクションを保存
  if (currentSection && currentContent.length > 0) {
    const sectionContent = currentContent.join('\n').trim()
    // markdownとして処理
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkSlug as any)
      .use(remarkBreaks)
      .use(remarkHtml, { sanitize: false })
      .process(preprocessMarkdown(sectionContent))
    
    sections[currentSection] = processedContent.toString()
  }
  
  // 特定のセクションを配列として処理（元のテキストから）
  const originalSections = parseTermSectionsOriginal(content)
  if (originalSections.synonyms) {
    const synonymsArray = originalSections.synonyms.split('\n').map((s: string) => s.trim()).filter(Boolean)
    sections.synonyms = synonymsArray.length > 0 ? synonymsArray : undefined
  }
  if (originalSections.antonyms) {
    const antonymsArray = originalSections.antonyms.split('\n').map((s: string) => s.trim()).filter(Boolean)
    sections.antonyms = antonymsArray.length > 0 ? antonymsArray : undefined
  }
  if (originalSections.siblings) {
    const siblingsArray = originalSections.siblings.split('\n').map((s: string) => s.trim()).filter(Boolean)
    sections.siblings = siblingsArray.length > 0 ? siblingsArray : undefined
  }
  if (originalSections.parents) {
    const parentsArray = originalSections.parents.split('\n').map((s: string) => s.trim()).filter(Boolean)
    sections.parents = parentsArray.length > 0 ? parentsArray : undefined
  }
  if (originalSections.children) {
    const childrenArray = originalSections.children.split('\n').map((s: string) => s.trim()).filter(Boolean)
    sections.children = childrenArray.length > 0 ? childrenArray : undefined
  }
  
  return sections
}

function parseTermSectionsOriginal(content: string) {
  const sections: any = {}
  const lines = content.split('\n')
  
  let currentSection = ''
  let currentContent: string[] = []
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // 前のセクションを保存
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      
      // 新しいセクションを開始
      const sectionName = line.replace('## ', '').toLowerCase()
      currentSection = sectionName
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }
  
  // 最後のセクションを保存
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }
  
  return sections
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
