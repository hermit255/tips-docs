import { NextRequest, NextResponse } from 'next/server'
import { loadLinkSettings, saveLinkSettings } from '@/lib/link-settings'
import { LinkSettings } from '@/lib/markdown-client'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

// 設定を取得
export async function GET() {
  try {
    const settings = loadLinkSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to load link settings:', error)
    return NextResponse.json(
      { error: 'Failed to load link settings' },
      { status: 500 }
    )
  }
}

// 設定を更新
export async function POST(request: NextRequest) {
  try {
    const settings: LinkSettings = await request.json()
    saveLinkSettings(settings)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save link settings:', error)
    return NextResponse.json(
      { error: 'Failed to save link settings' },
      { status: 500 }
    )
  }
}
