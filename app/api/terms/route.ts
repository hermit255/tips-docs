import { NextResponse } from 'next/server'
import { getTermFiles } from '@/lib/markdown-server'

export async function GET() {
  try {
    const terms = await getTermFiles()
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}
