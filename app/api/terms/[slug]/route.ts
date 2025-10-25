import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project') || 'default'
    
    const terms = await getTermFiles(project)
    const term = terms.find(t => t.path === params.slug)
    
    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }
    
    return NextResponse.json(term)
  } catch (error) {
    console.error('Error fetching term:', error)
    return NextResponse.json({ error: 'Failed to fetch term' }, { status: 500 })
  }
}
