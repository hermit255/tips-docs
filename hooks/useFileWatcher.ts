'use client'

import { useEffect } from 'react'

export function useFileWatcher(onFileChange: () => void) {
  useEffect(() => {
    // 静的生成時はファイル監視を無効化
    if (process.env.NODE_ENV === 'production') {
      return
    }
    
    // クライアントサイドではWebSocketやServer-Sent Eventsを使用してファイル変更を監視
    const eventSource = new EventSource('/api/watch')
    
    eventSource.onmessage = (event) => {
      if (event.data === 'file-changed') {
        onFileChange()
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [onFileChange])
}
