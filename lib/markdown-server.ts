import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

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

const docsDirectory = path.join(process.cwd(), 'docs')
const termsDirectory = path.join(process.cwd(), 'terms')

export async function getDocFiles(): Promise<DocFile[]> {
  const fileNames = getAllMarkdownFiles(docsDirectory)
  const docs = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(docsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content)
      
      const html = processedContent.toString()
      
      return {
        slug: fileName.replace(/\.md$/, ''),
        title: data.title || fileName.replace(/\.md$/, ''),
        content,
        html,
        path: fileName
      }
    })
  )
  
  return docs
}

export async function getTermFiles(): Promise<TermFile[]> {
  const fileNames = getAllMarkdownFiles(termsDirectory)
  const terms = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(termsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content)
      
      const html = processedContent.toString()
      
      // 用語ファイルの構造化データを抽出
      const sections = parseTermSections(content)
      
      return {
        slug: fileName.replace(/\.md$/, ''),
        title: data.title || fileName.replace(/\.md$/, ''),
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

function parseTermSections(content: string) {
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
  
  // 特定のセクションを配列として処理
  if (sections.synonyms) {
    sections.synonyms = sections.synonyms.split('\n').map((s: string) => s.trim()).filter(Boolean)
  }
  if (sections.antonyms) {
    sections.antonyms = sections.antonyms.split('\n').map((s: string) => s.trim()).filter(Boolean)
  }
  if (sections.siblings) {
    sections.siblings = sections.siblings.split('\n').map((s: string) => s.trim()).filter(Boolean)
  }
  if (sections.parents) {
    sections.parents = sections.parents.split('\n').map((s: string) => s.trim()).filter(Boolean)
  }
  if (sections.children) {
    sections.children = sections.children.split('\n').map((s: string) => s.trim()).filter(Boolean)
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
