import { NextRequest, NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function GET(request: NextRequest) {
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
    
    const terms = await getTermFiles(project)
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}
