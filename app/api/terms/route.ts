import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project') || 'default'
    
    const terms = await getTermFiles(project)
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}
