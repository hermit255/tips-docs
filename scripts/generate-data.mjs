import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkBreaks from 'remark-breaks'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// プロジェクトディレクトリのパス
const projectsDir = path.join(__dirname, '../projects')

// プロジェクト一覧を取得
function getProjects() {
  if (!fs.existsSync(projectsDir)) {
    return []
  }
  
  return fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      name: dirent.name,
      path: dirent.name
    }))
}

// プロジェクトのドキュメント一覧を取得
function getDocFiles(projectName) {
  const projectDir = path.join(projectsDir, projectName, 'docs')
  if (!fs.existsSync(projectDir)) {
    return []
  }
  
  const files = fs.readdirSync(projectDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(projectDir, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      // 改行処理を事前に実行
      const preprocessedContent = preprocessMarkdown(content)
      
      // markdownとして処理
      const processedContent = remark()
        .use(remarkGfm)
        .use(remarkSlug)
        .use(remarkBreaks)
        .use(remarkHtml, { sanitize: false })
        .processSync(preprocessedContent)
      
      let html = processedContent.toString()
      
      // HTMLレベルでもh1タグを除去（重複防止のため）
      html = html.replace(/<h1[^>]*>.*?<\/h1>/gi, '')
      
      // h1タグからタイトルを抽出する関数
      const extractH1Title = (content) => {
        const h1Match = content.match(/^#\s+(.+)$/m)
        return h1Match ? h1Match[1].trim() : null
      }
      
      const h1Title = extractH1Title(content)
      const title = data.title || h1Title || file.replace('.md', '')
      
      return {
        slug: file.replace('.md', ''),
        title,
        content,
        html,
        path: file.replace('.md', '')
      }
    })
  
  return files
}

// ディレクトリを再帰的に探索して用語ファイルを取得
function getTermFilesRecursive(dir, basePath = '') {
  const files = []
  
  if (!fs.existsSync(dir)) {
    return files
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name)
    const relativePath = basePath ? path.join(basePath, item.name) : item.name
    
    if (item.isDirectory()) {
      // サブディレクトリを再帰的に探索
      files.push(...getTermFilesRecursive(itemPath, relativePath))
    } else if (item.isFile() && item.name.endsWith('.md')) {
      // マークダウンファイルを処理
      const fileContents = fs.readFileSync(itemPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      // 改行処理を事前に実行
      const preprocessedContent = preprocessMarkdown(content)
      
      // markdownとして処理
      const processedContent = remark()
        .use(remarkGfm)
        .use(remarkSlug)
        .use(remarkBreaks)
        .use(remarkHtml, { sanitize: false })
        .processSync(preprocessedContent)
      
      let html = processedContent.toString()
      
      // HTMLレベルでもh1タグを除去（重複防止のため）
      html = html.replace(/<h1[^>]*>.*?<\/h1>/gi, '')
      
      // h1タグからタイトルを抽出する関数
      const extractH1Title = (content) => {
        const h1Match = content.match(/^#\s+(.+)$/m)
        return h1Match ? h1Match[1].trim() : null
      }
      
      const h1Title = extractH1Title(content)
      const title = data.title || h1Title || item.name.replace('.md', '')
      
      files.push({
        slug: relativePath.replace('.md', ''),
        title,
        content,
        html,
        path: relativePath.replace('.md', '')
      })
    }
  }
  
  return files
}

// プロジェクトの用語一覧を取得
function getTermFiles(projectName) {
  const projectDir = path.join(projectsDir, projectName, 'terms')
  return getTermFilesRecursive(projectDir)
}

// マークダウンの前処理
function preprocessMarkdown(content) {
  // 改行を適切に処理
  return content.replace(/\n/g, '\n\n')
}

// データを生成してJSONファイルに保存
function generateData() {
  console.log('Generating static data...')
  
  const projects = getProjects()
  console.log('Projects:', projects.map(p => p.name))
  
  const data = {
    projects,
    projectData: {}
  }
  
  // 各プロジェクトのデータを生成
  projects.forEach(project => {
    const docs = getDocFiles(project.name)
    const terms = getTermFiles(project.name)
    
    data.projectData[project.name] = {
      docs,
      terms
    }
    
    console.log(`Project ${project.name}: ${docs.length} docs, ${terms.length} terms`)
  })
  
  // データディレクトリを作成
  const dataDir = path.join(__dirname, '../public/data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  // JSONファイルに保存
  fs.writeFileSync(
    path.join(dataDir, 'projects.json'),
    JSON.stringify(data, null, 2)
  )
  
  console.log('Static data generated successfully!')
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  generateData()
}

export { generateData, getProjects, getDocFiles, getTermFiles }
