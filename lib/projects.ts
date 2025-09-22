import fs from 'fs'
import path from 'path'

export interface Project {
  name: string
  path: string
}

const projectsDirectory = path.join(process.cwd(), 'projects')

export function getProjects(): Project[] {
  const projects: Project[] = []
  
  if (!fs.existsSync(projectsDirectory)) {
    return projects
  }
  
  const items = fs.readdirSync(projectsDirectory)
  
  for (const item of items) {
    const itemPath = path.join(projectsDirectory, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory()) {
      // docsまたはtermsフォルダが存在するかチェック
      const docsPath = path.join(itemPath, 'docs')
      const termsPath = path.join(itemPath, 'terms')
      
      if (fs.existsSync(docsPath) || fs.existsSync(termsPath)) {
        projects.push({
          name: item,
          path: item
        })
      }
    }
  }
  
  return projects
}
