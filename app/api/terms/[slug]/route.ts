import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function generateStaticParams() {
  const projects = ['default', 'HunterHunter', 'system']
  const params = []
  
  for (const project of projects) {
    try {
      const terms = await getTermFiles(project)
      for (const term of terms) {
        params.push({
          slug: term.slug,
        })
      }
    } catch (error) {
      console.error(`Error generating static params for project ${project}:`, error)
    }
  }
  
  return params
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 静的生成時はrequest.urlが利用できないため、デフォルトプロジェクトを使用
    let project = 'default'
    try {
      const { searchParams } = new URL(request.url)
      project = searchParams.get('project') || 'default'
    } catch {
      // request.urlが利用できない場合はデフォルトを使用
      project = 'default'
    }
    
    const terms = await getTermFiles(project)
    const term = terms.find(t => t.slug === params.slug)
    
    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }
    
    return NextResponse.json(term)
  } catch (error) {
    console.error('Error fetching term:', error)
    return NextResponse.json({ error: 'Failed to fetch term' }, { status: 500 })
  }
}
