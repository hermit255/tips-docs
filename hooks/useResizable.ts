import { useState, useCallback, useEffect } from 'react'

interface UseResizableOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  storageKey?: string
}

export function useResizable({
  initialWidth,
  minWidth,
  maxWidth,
  storageKey
}: UseResizableOptions) {
  const [width, setWidth] = useState(() => {
    // 初期化時にローカルストレージから値を取得
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed
        }
      }
    }
    return initialWidth
  })

  // ローカルストレージに幅を保存
  const saveWidth = useCallback((newWidth: number) => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newWidth.toString())
    }
  }, [storageKey])

  // リサイズ開始
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startWidth = width
    let currentWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      // 左にドラッグ（deltaX < 0）で幅を増やし、右にドラッグ（deltaX > 0）で幅を減らす
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - deltaX))
      currentWidth = newWidth
      setWidth(newWidth)
      
      // デバッグ用ログ（本番では削除）
      console.log(`Resize: deltaX=${deltaX}, startWidth=${startWidth}, newWidth=${newWidth}`)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // リサイズ終了時に現在の幅を保存
      saveWidth(currentWidth)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width, minWidth, maxWidth, saveWidth])

  return {
    width,
    startResize
  }
}
