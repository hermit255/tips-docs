import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

export async function generateStaticParams() {
  const projects = ['default', 'HunterHunter', 'system']
  const params = []
  
  for (const project of projects) {
    try {
      const docs = await getDocFiles(project)
      for (const doc of docs) {
        params.push({
          slug: encodeURIComponent(doc.path),
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
    
    console.log('API: Raw slug from params:', params.slug)
    console.log('API: Decoded slug:', decodeURIComponent(params.slug))
    console.log('API: Project:', project)
    
    const docs = await getDocFiles(project)
    console.log('API: Available docs:', docs.map(d => d.path))
    
    // デコードされたslugで検索
    const decodedSlug = decodeURIComponent(params.slug)
    const doc = docs.find(d => d.path === decodedSlug)
    
    if (!doc) {
      console.log('API: Document not found for slug:', decodedSlug)
      console.log('API: Available paths:', docs.map(d => d.path))
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    console.log('API: Found doc:', doc.path)
    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching doc:', error)
    return NextResponse.json({ error: 'Failed to fetch doc' }, { status: 500 })
  }
}
