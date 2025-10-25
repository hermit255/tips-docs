import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project')
    
    if (!project) {
      return NextResponse.json({ error: 'Project parameter is required' }, { status: 400 })
    }
    
    const terms = await getTermFiles(project)
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Failed to fetch terms:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}
