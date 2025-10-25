/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本設定
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

// GitHub Pages用の設定（本番環境のみ）
if (process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS) {
  nextConfig.output = 'export'
  nextConfig.trailingSlash = true
  nextConfig.basePath = '/tips-docs'
  nextConfig.assetPrefix = '/tips-docs'
}

module.exports = nextConfig
