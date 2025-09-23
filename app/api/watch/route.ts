import { NextRequest, NextResponse } from 'next/server'
import { fileWatcher } from '@/lib/fileWatcher'

export async function GET(request: NextRequest) {
  // 静的生成時はこのエンドポイントを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      const sendMessage = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      }

      // ファイル変更のコールバックを設定
      fileWatcher.onFileChange(() => {
        sendMessage('file-changed')
      })

      // 接続確認メッセージを送信
      sendMessage('connected')
    },
    cancel() {
      // クリーンアップ処理
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
