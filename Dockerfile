FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール（ビルド用にdevDependenciesも含める）
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# 本番用の依存関係のみを再インストール
RUN npm install --omit=dev && npm cache clean --force

# ポート3000を公開
EXPOSE 3000

# 本番サーバーを起動
CMD ["npm", "start"]
