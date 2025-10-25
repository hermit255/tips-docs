/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages用の静的エクスポート設定
  output: 'export',
  trailingSlash: true,
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

module.exports = nextConfig
