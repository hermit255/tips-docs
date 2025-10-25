import fs from 'fs'
import path from 'path'
import { LinkSettings, LinkExceptionRule } from '@/types'
import { DEFAULT_LINK_EXCEPTION_RULES } from './markdown-client'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'link-settings.json')

// 設定を読み込む
export function loadLinkSettings(): LinkSettings {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
      const settings: LinkSettings = JSON.parse(configData)
      
      // デフォルトルールとマージ（設定ファイルにないルールを追加）
      const defaultRuleIds = DEFAULT_LINK_EXCEPTION_RULES.map(rule => rule.id)
      const configRuleIds = settings.rules.map(rule => rule.id)
      
      // 設定ファイルにないデフォルトルールを追加
      const missingRules = DEFAULT_LINK_EXCEPTION_RULES.filter(
        rule => !configRuleIds.includes(rule.id)
      )
      
      settings.rules = [...settings.rules, ...missingRules]
      
      return settings
    }
  } catch (error) {
    console.warn('Failed to load link settings, using defaults:', error)
  }
  
  // デフォルト設定を返す
  return {
    enabled: true,
    rules: DEFAULT_LINK_EXCEPTION_RULES
  }
}

// 設定を保存する
export function saveLinkSettings(settings: LinkSettings): void {
  try {
    // configディレクトリが存在しない場合は作成
    const configDir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to save link settings:', error)
    throw error
  }
}

// ルールを更新する
export function updateLinkRule(ruleId: string, updates: Partial<LinkExceptionRule>): LinkSettings {
  const settings = loadLinkSettings()
  const ruleIndex = settings.rules.findIndex(rule => rule.id === ruleId)
  
  if (ruleIndex !== -1) {
    settings.rules[ruleIndex] = { ...settings.rules[ruleIndex], ...updates }
  } else {
    // 新しいルールを追加
    if (updates.id && updates.name && updates.type) {
      settings.rules.push({
        id: updates.id,
        name: updates.name,
        pattern: updates.pattern || /.*/,
        description: updates.description || '',
        enabled: updates.enabled ?? true,
        type: updates.type,
        config: updates.config
      })
    }
  }
  
  saveLinkSettings(settings)
  return settings
}

// ルールを削除する
export function deleteLinkRule(ruleId: string): LinkSettings {
  const settings = loadLinkSettings()
  settings.rules = settings.rules.filter(rule => rule.id !== ruleId)
  saveLinkSettings(settings)
  return settings
}
