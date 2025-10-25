/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages用の静的エクスポートはAPIルートがあるため使用不可
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // },
  // experimental: {
  //   // APIルートを動的ルートとして明示的に指定
  //   dynamicIO: true,
  // },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

module.exports = nextConfig
