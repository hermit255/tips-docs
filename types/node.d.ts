// Node.js型定義の補完

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      GITHUB_ACTIONS?: string
    }
  }
}

export {}
