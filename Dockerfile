# ビルドステージ
FROM node:18-alpine AS builder

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# 静的サイトをビルド
RUN npm run build

# 本番用ステージ（nginx）
FROM nginx:alpine

# ビルドされた静的ファイルをコピー
COPY --from=builder /app/out /usr/share/nginx/html

# ポート80を公開
EXPOSE 80

# nginxを起動
CMD ["nginx", "-g", "daemon off;"]
