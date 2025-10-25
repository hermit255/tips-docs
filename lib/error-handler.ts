// 共通のエラーハンドリング

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 0, details)
    this.name = 'NetworkError'
  }
}

/**
 * エラーを安全にログ出力
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}]` : ''
  
  if (error instanceof AppError) {
    console.error(`${timestamp} ${contextStr} ${error.name}: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    })
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error: ${error.message}`, {
      stack: error.stack
    })
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error)
  }
}

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return '入力データに問題があります。'
      case 'NOT_FOUND':
        return '要求されたリソースが見つかりません。'
      case 'NETWORK_ERROR':
        return 'ネットワークエラーが発生しました。'
      default:
        return 'エラーが発生しました。'
    }
  } else if (error instanceof Error) {
    return '予期しないエラーが発生しました。'
  } else {
    return '不明なエラーが発生しました。'
  }
}

/**
 * 非同期関数のエラーハンドリング
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    logError(error, context)
    return null
  }
}

/**
 * 同期関数のエラーハンドリング
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  context?: string
): T | null {
  try {
    return fn()
  } catch (error) {
    logError(error, context)
    return null
  }
}
