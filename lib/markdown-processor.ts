// 共通のマークダウン処理

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkBreaks from 'remark-breaks'
import { DocFile, TermFile } from '@/types'

/**
 * マークダウンの前処理
 */
export function preprocessMarkdown(content: string): string {
  return content
    .replace(/\r\n/g, '\n')   // Windows改行を統一
    .replace(/\r/g, '\n')     // Mac改行を統一
    .replace(/\n{3,}/g, '\n\n') // 3つ以上の連続改行を2つに統一
    .replace(/^#\s+.+$/gm, '') // h1タグを除去（重複防止のため）
}

/**
 * マークダウンファイルを処理してHTMLに変換
 */
export async function processMarkdownFile(filePath: string): Promise<{
  content: string
  html: string
  title: string
  data: any
}> {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // 改行処理を事前に実行
  const preprocessedContent = preprocessMarkdown(content)
  
  // markdownとして処理
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkSlug as any)
    .use(remarkBreaks)
    .use(remarkHtml, { sanitize: false })
    .process(preprocessedContent)
  
  const html = processedContent.toString()
  
  // h1タグからタイトルを抽出
  const extractH1Title = (content: string): string | null => {
    const h1Match = content.match(/^#\s+(.+)$/m)
    return h1Match ? h1Match[1].trim() : null
  }
  
  const h1Title = extractH1Title(content)
  const title = data.title || h1Title || path.basename(filePath, '.md')
  
  return {
    content,
    html,
    title,
    data
  }
}

/**
 * ディレクトリ内のすべてのマークダウンファイルを取得
 */
export function getAllMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return []
  }
  
  const files: string[] = []
  
  function scanDirectory(currentDir: string, relativePath: string = '') {
    const items = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item.name)
      const itemRelativePath = relativePath ? path.join(relativePath, item.name) : item.name
      
      if (item.isDirectory()) {
        scanDirectory(itemPath, itemRelativePath)
      } else if (item.isFile() && item.name.endsWith('.md')) {
        files.push(itemRelativePath)
      }
    }
  }
  
  scanDirectory(dir)
  return files
}

/**
 * 用語ファイルのセクションを解析
 */
export async function parseTermSections(content: string) {
  const sections: Record<string, string[]> = {
    summary: [],
    description: [],
    synonyms: [],
    antonyms: [],
    siblings: [],
    parents: [],
    children: []
  }
  
  const lines = content.split('\n')
  let currentSection: string | null = null
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // セクションヘッダーを検出
    if (trimmedLine.startsWith('## ')) {
      const sectionName = trimmedLine.substring(3).toLowerCase()
      if (sectionName in sections) {
        currentSection = sectionName
      } else {
        currentSection = null
      }
      continue
    }
    
    // セクションの内容を追加
    if (currentSection && trimmedLine) {
      sections[currentSection].push(trimmedLine)
    }
  }
  
  // 配列を文字列に変換（空の場合はundefined）
  const result: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(sections)) {
    if (value.length === 0) {
      continue
    } else if (value.length === 1) {
      result[key] = value[0]
    } else {
      result[key] = value
    }
  }
  
  return result
}

/**
 * ドキュメントファイルを作成
 */
export function createDocFile(
  fileName: string,
  content: string,
  html: string,
  title: string
): DocFile {
  return {
    slug: fileName.replace(/\.md$/, ''),
    title,
    content,
    html,
    path: fileName.replace(/\.md$/, '')
  }
}

/**
 * 用語ファイルを作成
 */
export function createTermFile(
  fileName: string,
  content: string,
  html: string,
  title: string,
  sections: Record<string, any>
): TermFile {
  return {
    slug: fileName.replace(/\.md$/, ''),
    title,
    content,
    html,
    path: fileName.replace(/\.md$/, ''),
    ...sections
  }
}
