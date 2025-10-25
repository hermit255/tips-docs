// サーバーサイド用のマークダウン処理（リファクタリング版）

import fs from 'fs'
import path from 'path'
import { DocFile, TermFile, MenuItem } from '@/types'
import {
  processMarkdownFile,
  getAllMarkdownFiles,
  parseTermSections,
  createDocFile,
  createTermFile
} from './markdown-processor'

export async function getProjects(): Promise<Array<{name: string, path: string}>> {
  const projectsDirectory = path.join(process.cwd(), 'projects')
  
  if (!fs.existsSync(projectsDirectory)) {
    return []
  }
  
  const projectNames = fs.readdirSync(projectsDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      name: dirent.name,
      path: dirent.name
    }))
  
  return projectNames
}

export async function getDocFiles(projectName: string = 'default'): Promise<DocFile[]> {
  const docsDirectory = path.join(process.cwd(), 'projects', projectName, 'docs')
  const fileNames = getAllMarkdownFiles(docsDirectory)
  
  const docs = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(docsDirectory, fileName)
      const { content, html, title } = await processMarkdownFile(fullPath)
      return createDocFile(fileName, content, html, title)
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
      const { content, html, title } = await processMarkdownFile(fullPath)
      const sections = await parseTermSections(content)
      return createTermFile(fileName, content, html, title, sections)
    })
  )
  
  return terms
}

export function buildMenuStructure(docs: DocFile[], terms: TermFile[]): MenuItem[] {
  const menuItems: MenuItem[] = []
  
  // ドキュメントを追加
  docs.forEach(doc => {
    menuItems.push({
      title: doc.title,
      path: doc.path,
      type: 'doc'
    })
  })
  
  // 用語を追加
  terms.forEach(term => {
    menuItems.push({
      title: term.title,
      path: term.path,
      type: 'term'
    })
  })
  
  return menuItems
}
