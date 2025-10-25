// クライアントサイド用のユーティリティ関数

import { DocFile, TermFile, LinkExceptionRule, MenuItem } from '@/types'

// 特殊リンク例外ルールの型定義（共通型を使用）

// 特殊リンク設定（共通型を使用）

// デフォルトの例外ルール
export const DEFAULT_LINK_EXCEPTION_RULES: LinkExceptionRule[] = [
  {
    id: 'self-reference',
    type: 'self-reference',
    enabled: true,
    pattern: undefined,
    description: '自ファイル名参照の場合は特殊リンクを設定しない'
  },
  {
    id: 'kanji-context',
    type: 'kanji-context',
    enabled: true,
    pattern: /(?<=[一-龯])[^一-龯]*(?=[一-龯])/g,
    description: '漢字コンテキストでのリンク化を制限'
  }
]

// 例外ルールの判定関数
export function shouldSkipLink(
  match: string,
  fullText: string,
  matchIndex: number,
  currentFileName: string,
  rules: LinkExceptionRule[]
): boolean {
  const enabledRules = rules.filter(rule => rule.enabled)
  
  for (const rule of enabledRules) {
    switch (rule.type) {
      case 'self-reference':
        if (match === currentFileName) {
          return true
        }
        break
        
      case 'kanji-context':
        if (hasKanjiContext(fullText, matchIndex, match.length)) {
          return true
        }
        break
        
      case 'custom':
        if (rule.config?.pattern) {
          try {
            const regex = new RegExp(rule.config.pattern, rule.config.flags || 'g')
            if (regex.test(match)) {
              return true
            }
          } catch (error) {
            console.warn(`Invalid custom rule pattern: ${rule.config.pattern}`, error)
          }
        }
        break
    }
  }
  
  return false
}

// 漢字コンテキストの判定
function hasKanjiContext(text: string, matchIndex: number, matchLength: number): boolean {
  const beforeChar = text[matchIndex - 1]
  const afterChar = text[matchIndex + matchLength]
  
  // 前後に漢字があるかチェック
  const hasKanjiBefore = beforeChar ? isKanji(beforeChar) : false
  const hasKanjiAfter = afterChar ? isKanji(afterChar) : false
  
  return hasKanjiBefore || hasKanjiAfter
}

// 漢字判定関数
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0)
  return (
    (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
    (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
    (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
    (code >= 0x2B820 && code <= 0x2CEAF) || // CJK Extension E
    (code >= 0x2CEB0 && code <= 0x2EBEF) || // CJK Extension F
    (code >= 0x30000 && code <= 0x3134F)    // CJK Extension G
  )
}

// HTMLの属性値内かどうかを判定する関数
function isInsideHtmlAttribute(html: string, position: number): boolean {
  // 指定位置より前の文字列を取得
  const beforePosition = html.substring(0, position)
  
  // 最後のタグの開始位置を探す
  const lastTagStart = beforePosition.lastIndexOf('<')
  const lastTagEnd = beforePosition.lastIndexOf('>')
  
  // タグ内にいるかチェック
  if (lastTagStart > lastTagEnd) {
    // タグ内の属性を解析
    const tagContent = beforePosition.substring(lastTagStart)
    
    // 属性値の開始位置を探す（=の後）
    const equalsIndex = tagContent.lastIndexOf('=')
    if (equalsIndex === -1) return false
    
    // 属性値の開始文字を探す
    const afterEquals = tagContent.substring(equalsIndex + 1)
    const quoteIndex = afterEquals.search(/["']/)
    if (quoteIndex === -1) return false
    
    const quoteChar = afterEquals[quoteIndex]
    const attributeValueStart = lastTagStart + equalsIndex + 1 + quoteIndex
    
    // 属性値の終了位置を探す
    const afterQuote = afterEquals.substring(quoteIndex + 1)
    const endQuoteIndex = afterQuote.indexOf(quoteChar)
    if (endQuoteIndex === -1) return false
    
    const attributeValueEnd = attributeValueStart + 1 + endQuoteIndex
    
    // 指定位置が属性値内にあるかチェック
    return position >= attributeValueStart + 1 && position <= attributeValueEnd
  }
  
  return false
}

// 共通のMenuItem型を使用

export function buildMenuStructure(docs: DocFile[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>()
  const rootItems: MenuItem[] = []
  
  for (const doc of docs) {
    const pathParts = doc.path.split('/')
    let currentPath = ''
    let parentItems = rootItems
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (!menuMap.has(currentPath)) {
        const isFile = i === pathParts.length - 1
        const menuItem: MenuItem = {
          title: isFile ? doc.title : part.replace(/\.md$/, ''),
          path: currentPath,
          type: isFile ? 'doc' : 'doc', // フォルダも'doc'タイプとして扱う
          children: isFile ? undefined : []
        }
        
        menuMap.set(currentPath, menuItem)
        parentItems.push(menuItem)
      }
      
      const currentItem = menuMap.get(currentPath)!
      if (currentItem.children) {
        parentItems = currentItem.children
      }
    }
  }
  
  return rootItems
}

export function buildTermMenuStructure(terms: TermFile[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>()
  const rootItems: MenuItem[] = []
  
  for (const term of terms) {
    const pathParts = term.path.split('/')
    let currentPath = ''
    let parentItems = rootItems
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (!menuMap.has(currentPath)) {
        const isFile = i === pathParts.length - 1
        const menuItem: MenuItem = {
          title: isFile ? term.title : part.replace(/\.md$/, ''),
          path: currentPath,
          type: isFile ? 'term' : 'doc',
          children: isFile ? undefined : []
        }
        
        menuMap.set(currentPath, menuItem)
        parentItems.push(menuItem)
      }
      
      const currentItem = menuMap.get(currentPath)!
      if (currentItem.children) {
        parentItems = currentItem.children
      }
    }
  }
  
  return rootItems
}

export function extractTocFromHtml(html: string): Array<{id: string, text: string, level: number}> {
  const toc: Array<{id: string, text: string, level: number}> = []
  
  // デバッグ用ログ
  console.log('Extracting TOC from HTML:', html.substring(0, 500) + '...')
  
  // 見出しを検索（id属性の有無に関係なく）
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const fullMatch = match[0]
    const text = match[2].replace(/<[^>]*>/g, '') // HTMLタグを除去
    
    // id属性を抽出
    const idMatch = fullMatch.match(/id="([^"]*)"/)
    let id = idMatch ? idMatch[1] : ''
    
    // id属性がない場合は、見出しテキストからidを生成
    if (!id) {
      // 日本語対応のid生成
      id = text
        .toLowerCase()
        .replace(/\s+/g, '-')           // スペースをハイフンに
        .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAFa-z0-9\-]/g, '') // 日本語文字、英数字、ハイフンのみ残す
        .replace(/-+/g, '-')            // 連続するハイフンを1つに
        .replace(/^-|-$/g, '')          // 先頭と末尾のハイフンを削除
    }
    
    // 空のidの場合は、レベルとインデックスを使用
    if (!id) {
      id = `heading-${level}-${toc.length}`
    }
    
    toc.push({ id, text, level })
  }
  
  console.log('Generated TOC:', toc)
  return toc
}

export function processContentWithLinks(
  html: string, 
  terms: TermFile[], 
  docs: DocFile[], 
  currentFileName: string = '',
  exceptionRules: LinkExceptionRule[] = DEFAULT_LINK_EXCEPTION_RULES
): string {
  let processedHtml = html
  
  // 用語ファイル名を長さ順でソート（長い順）
  const sortedTerms = [...terms].sort((a, b) => b.title.length - a.title.length)
  
  // 用語ファイル名と一致するテキストを特殊リンクAに変換
  processedHtml = processTermsWithPriority(processedHtml, sortedTerms, currentFileName, exceptionRules)
  
  // ドキュメントファイル名を長さ順でソート（長い順）
  const sortedDocs = [...docs].sort((a, b) => b.title.length - a.title.length)
  
  // ドキュメントファイル名と一致するテキストを特殊リンクBに変換
  processedHtml = processDocsWithPriority(processedHtml, sortedDocs, currentFileName, exceptionRules)
  
  return processedHtml
}

function processTermsWithPriority(
  html: string, 
  sortedTerms: TermFile[], 
  currentFileName: string, 
  exceptionRules: LinkExceptionRule[]
): string {
  // HTMLの属性値を一時的に置換して保護
  const attributePlaceholders: string[] = []
  let processedHtml = html.replace(/="([^"]*)"/g, (match, content) => {
    const placeholder = `__ATTR_PLACEHOLDER_${attributePlaceholders.length}__`
    attributePlaceholders.push(content)
    return `="${placeholder}"`
  })
  
  // hタグ内のテキストを一時的に置換して保護
  const headingPlaceholders: { tag: string; content: string }[] = []
  processedHtml = processedHtml.replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/g, (match, tag, content) => {
    const placeholder = `__HEADING_PLACEHOLDER_${headingPlaceholders.length}__`
    headingPlaceholders.push({ tag, content })
    return `<${tag}>${placeholder}</${tag}>`
  })
  
  // デバッグ用ログ
  console.log('Processing terms with priority:', sortedTerms.map(t => t.title))
  
  // すべての用語のマッチを検索して、長い名前を優先して処理
  const allMatches: Array<{term: TermFile, match: string, start: number, end: number}> = []
  
  sortedTerms.forEach(term => {
    const termName = term.title
    // 日本語の文字境界を適切に処理する正規表現
    // 前後に##がない、かつ前後に日本語文字（ひらがな、カタカナ、漢字）がない場合にマッチ
    // ただし、助詞（の、を、について、など）が後続する場合は許可
    const escapedTermName = termName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // 日本語の特殊リンク用の正規表現
    // 前後に##がない場合にマッチ
    // 用語名の後に日本語文字（敬語、助詞など）が続く場合も許可
    const regex = new RegExp(`(?<!##)${escapedTermName}(?!##)`, 'g')
    
    let match
    while ((match = regex.exec(processedHtml)) !== null) {
      allMatches.push({
        term,
        match: termName,
        start: match.index,
        end: match.index + termName.length
      })
    }
  })
  
  // 重複するマッチを除去（長い名前を優先）
  const filteredMatches = allMatches.filter((match, index) => {
    return !allMatches.some((otherMatch, otherIndex) => {
      if (otherIndex === index) return false
      // 他のマッチがこのマッチの範囲内にある場合は除外
      return otherMatch.start <= match.start && otherMatch.end >= match.end
    })
  })
  
  // 開始位置の降順でソート（後ろから処理してインデックスのずれを防ぐ）
  filteredMatches.sort((a, b) => b.start - a.start)
  
  // マッチを置換
  filteredMatches.forEach(({term, match, start, end}) => {
    // 例外ルールをチェック
    if (shouldSkipLink(match, processedHtml, start, currentFileName, exceptionRules)) {
      console.log('Skipping term link due to exception rules:', match)
      return // リンク化しない
    }
    
    console.log('Creating term link:', {term: term.title, match, start, end})
    
    const before = processedHtml.substring(0, start)
    const after = processedHtml.substring(end)
    const replacement = `<span class="term-link" data-term="${term.path}">${match}</span>`
    
    processedHtml = before + replacement + after
  })
  
  // hタグの内容を元に戻す
  headingPlaceholders.forEach(({ tag, content }, index) => {
    const placeholder = `__HEADING_PLACEHOLDER_${index}__`
    processedHtml = processedHtml.replace(placeholder, content)
  })
  
  // 属性値を元に戻す
  attributePlaceholders.forEach((content, index) => {
    const placeholder = `__ATTR_PLACEHOLDER_${index}__`
    processedHtml = processedHtml.replace(placeholder, content)
  })
  
  return processedHtml
}

function processDocsWithPriority(
  html: string, 
  sortedDocs: DocFile[], 
  currentFileName: string, 
  exceptionRules: LinkExceptionRule[]
): string {
  // HTMLの属性値を一時的に置換して保護
  const attributePlaceholders: string[] = []
  let processedHtml = html.replace(/="([^"]*)"/g, (match, content) => {
    const placeholder = `__ATTR_PLACEHOLDER_${attributePlaceholders.length}__`
    attributePlaceholders.push(content)
    return `="${placeholder}"`
  })
  
  // hタグ内のテキストを一時的に置換して保護
  const headingPlaceholders: { tag: string; content: string }[] = []
  processedHtml = processedHtml.replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/g, (match, tag, content) => {
    const placeholder = `__HEADING_PLACEHOLDER_${headingPlaceholders.length}__`
    headingPlaceholders.push({ tag, content })
    return `<${tag}>${placeholder}</${tag}>`
  })
  
  // すべてのドキュメントのマッチを検索して、長い名前を優先して処理
  const allMatches: Array<{doc: DocFile, match: string, start: number, end: number}> = []
  
  sortedDocs.forEach(doc => {
    const docName = doc.title
    // 日本語の文字境界を適切に処理する正規表現
    // 前後に##がない場合にマッチ
    // 用語名の後に日本語文字（敬語、助詞など）が続く場合も許可
    const regex = new RegExp(`(?<!##)${docName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!##)`, 'g')
    let match
    while ((match = regex.exec(processedHtml)) !== null) {
      
      allMatches.push({
        doc,
        match: docName, // ドキュメント名のみを使用（マッチしたテキスト全体ではなく）
        start: match.index,
        end: match.index + docName.length // ドキュメント名の長さを使用
      })
    }
  })
  
  // 重複するマッチを除去（長い名前を優先）
  const filteredMatches = allMatches.filter((match, index) => {
    return !allMatches.some((otherMatch, otherIndex) => {
      if (otherIndex === index) return false
      // 他のマッチがこのマッチの範囲内にある場合は除外
      return otherMatch.start <= match.start && otherMatch.end >= match.end
    })
  })
  
  // 開始位置の降順でソート（後ろから処理してインデックスのずれを防ぐ）
  filteredMatches.sort((a, b) => b.start - a.start)
  
  // マッチを置換
  filteredMatches.forEach(({doc, match, start, end}) => {
    // 例外ルールをチェック
    if (shouldSkipLink(match, processedHtml, start, currentFileName, exceptionRules)) {
      return // リンク化しない
    }
    
    const before = processedHtml.substring(0, start)
    const after = processedHtml.substring(end)
    const replacement = `<span class="doc-link" data-doc="${doc.path}">${match}</span>`
    
    processedHtml = before + replacement + after
  })
  
  // hタグの内容を元に戻す
  headingPlaceholders.forEach(({ tag, content }, index) => {
    const placeholder = `__HEADING_PLACEHOLDER_${index}__`
    processedHtml = processedHtml.replace(placeholder, content)
  })
  
  // 属性値を元に戻す
  attributePlaceholders.forEach((content, index) => {
    const placeholder = `__ATTR_PLACEHOLDER_${index}__`
    processedHtml = processedHtml.replace(placeholder, content)
  })
  
  return processedHtml
}
