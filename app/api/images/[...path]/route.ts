import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 動的ルートとして明示的に指定
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // パスをデコードして結合
    const imagePath = params.path.map(segment => decodeURIComponent(segment)).join('/')
    
    // プロジェクトディレクトリ内の画像ファイルのみ許可
    const fullPath = path.join(process.cwd(), 'projects', imagePath)
    
    // セキュリティチェック: プロジェクトディレクトリ内かどうか確認
    const projectsDir = path.join(process.cwd(), 'projects')
    const resolvedPath = path.resolve(fullPath)
    const resolvedProjectsDir = path.resolve(projectsDir)
    
    if (!resolvedPath.startsWith(resolvedProjectsDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // ファイルを読み込み
    const fileBuffer = fs.readFileSync(resolvedPath)
    
    // ファイル拡張子からMIMEタイプを決定
    const ext = path.extname(resolvedPath).toLowerCase()
    let mimeType = 'application/octet-stream'
    
    switch (ext) {
      case '.png':
        mimeType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg'
        break
      case '.gif':
        mimeType = 'image/gif'
        break
      case '.webp':
        mimeType = 'image/webp'
        break
      case '.svg':
        mimeType = 'image/svg+xml'
        break
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // 1年キャッシュ
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
