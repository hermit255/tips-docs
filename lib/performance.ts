// パフォーマンス最適化ユーティリティ

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * スロットル関数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * メモ化関数
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 遅延実行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * バッチ処理
 */
export class BatchProcessor<T> {
  private items: T[] = []
  private timeout: NodeJS.Timeout | null = null
  
  constructor(
    private processor: (items: T[]) => void | Promise<void>,
    private batchSize: number = 10,
    private delayMs: number = 100
  ) {}
  
  add(item: T): void {
    this.items.push(item)
    
    if (this.items.length >= this.batchSize) {
      this.flush()
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.delayMs)
    }
  }
  
  async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    
    if (this.items.length > 0) {
      const itemsToProcess = [...this.items]
      this.items = []
      await this.processor(itemsToProcess)
    }
  }
}

/**
 * パフォーマンス測定
 */
export class PerformanceTimer {
  private startTime: number = 0
  private endTime: number = 0
  
  start(): void {
    this.startTime = performance.now()
  }
  
  end(): number {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  }
  
  getDuration(): number {
    return this.endTime - this.startTime
  }
}

/**
 * リソースプール
 */
export class ResourcePool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  
  constructor(
    private factory: () => T,
    private maxSize: number = 10
  ) {}
  
  acquire(): T {
    if (this.available.length > 0) {
      const resource = this.available.pop()!
      this.inUse.add(resource)
      return resource
    }
    
    if (this.inUse.size < this.maxSize) {
      const resource = this.factory()
      this.inUse.add(resource)
      return resource
    }
    
    throw new Error('Resource pool exhausted')
  }
  
  release(resource: T): void {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource)
      this.available.push(resource)
    }
  }
  
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    }
  }
}
