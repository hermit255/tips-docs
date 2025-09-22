import { NextResponse } from 'next/server'
import { getDocFiles } from '@/lib/markdown-server'

export async function GET() {
  try {
    const docs = await getDocFiles()
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching docs:', error)
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 })
  }
}
