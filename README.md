## このアプリについて
- markdownで作った資料のプレイヤー
- サブペインに用語情報を表示することで、資料中の用語がよくわからないまま読み進めることなく資料を読む体験を提供する

[使用イメージ](design/ss.png)

### ドキュメント
- 通常の資料であり議事録・設計書・マニュアルなど用途は何に使っても良い
### 用語
- 所定のフォーマットで登録することで、ドキュメント閲覧時にtooltipやリンクとして連携する

## 使い方
- `docker compose up` すればNext.jsでサーバーが起動する。http://localhost:3000 から閲覧可能
- プロジェクト単位でドキュメントが管理でき、`projects/{projectName}/docs`(ドキュメントファイル) `projects/{projectName}/terms`(用語ファイル)を元にサービス内でビルドされる

## GitHub Pages デプロイ

このアプリケーションはGitHub Pagesで静的サイトとしてデプロイできます。

### 設定手順

1. **GitHub Pagesの設定**:
   - リポジトリの Settings > Pages に移動
   - Source を "GitHub Actions" に設定

2. **自動デプロイ**:
   - mainブランチにプッシュすると自動的にデプロイされます
   - GitHub Actionsでビルドとデプロイが実行されます

3. **アクセス**:
   - `https://{username}.github.io/{repository-name}` でアクセス可能

### ローカル開発

```bash
# 開発サーバー起動
docker compose up

# 静的ビルド（GitHub Pages用）
npm run build
```

## 備考
- AIコーディングの実験として作ったものなので、ファイル名の日本語対応やフォルダの複層化でエラーが起きるケースがある課題は残っている
- wikipediaのリンクのような注釈での関連情報の見やすさを目指した
- 新人研修のような前提知識を共有できていない対象への説明は至難なので、前提知識のカンペを見ながら読み進められる体験を提供したかった
