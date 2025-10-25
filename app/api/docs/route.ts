import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project')
    
    if (!project) {
      return NextResponse.json({ error: 'Project parameter is required' }, { status: 400 })
    }
    
    const docs = await getDocFiles(project)
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Failed to fetch docs:', error)
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 })
  }
}
