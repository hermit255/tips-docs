import { NextRequest } from 'next/server'
import { fileWatcher } from '@/lib/fileWatcher'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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
