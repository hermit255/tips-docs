import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const terms = await getTermFiles()
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
