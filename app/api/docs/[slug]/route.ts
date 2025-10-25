import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project') || 'default'
    
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
