import { NextRequest, NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

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
    
    const docs = await getDocFiles(project)
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching docs:', error)
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 })
  }
}
