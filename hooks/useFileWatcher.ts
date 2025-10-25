'use client'

import { useEffect } from 'react'

export function useFileWatcher(onFileChange: () => void) {
  useEffect(() => {
    // 静的エクスポートではファイル監視は無効化
    // 必要に応じて手動でリロードする
    console.log('File watching disabled in static export mode')
    
    // 開発環境でのみファイル監視を有効化
    if (process.env.NODE_ENV === 'development') {
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
    }
  }, [onFileChange])
}
