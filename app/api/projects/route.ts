import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/projects'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const projects = getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
