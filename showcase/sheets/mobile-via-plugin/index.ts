import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Mobile Example (Plugin Mode)',
    'zh-CN': '移动端示例（插件模式）',
    'zh-TW': '行動端範例（插件模式）',
    'ja-JP': 'モバイル例（プラグインモード）',
  },
  description: {
    'en-US': 'A mobile-adapted example of Univer Sheets in plugin mode, using the Mobile UI Plugin to provide a touch-friendly experience.',
    'zh-CN': 'Univer Sheets 插件模式下的移动端适配示例，使用 Mobile UI 插件提供触摸友好的体验。',
    'zh-TW': 'Univer Sheets 插件模式下的行動端適配範例，使用 Mobile UI 插件提供觸控友善體驗。',
    'ja-JP': 'Univer Sheets のプラグインモードにおけるモバイル対応例。Mobile UI プラグインでタッチ操作に最適化。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode', 'Mobile'],
    'zh-CN': ['Univer Sheets', '插件模式', '移动端'],
    'zh-TW': ['Univer Sheets', '插件模式', '行動端'],
    'ja-JP': ['Univer Sheets', 'プラグインモード', 'モバイル'],
  },
}

export const files = {
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
