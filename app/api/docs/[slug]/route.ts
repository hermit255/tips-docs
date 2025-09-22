import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project') || 'default'
    
    const docs = await getDocFiles(project)
    const doc = docs.find(d => d.path === params.slug)
    
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching doc:', error)
    return NextResponse.json({ error: 'Failed to fetch doc' }, { status: 500 })
  }
}
