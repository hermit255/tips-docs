import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project') || 'default'
    
    const docs = await getDocFiles(project)
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching docs:', error)
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 })
  }
}
