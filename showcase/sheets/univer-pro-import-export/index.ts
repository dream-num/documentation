import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Univer SDK Pro Import & Export',
    'zh-CN': 'Univer SDK Pro 导入导出',
    'zh-TW': 'Univer SDK Pro 匯入匯出',
    'ja-JP': 'Univer SDK Pro インポート/エクスポート',
  },
  description: {
    'en-US':
      'Demonstrates Sheets import and export in plugin mode, including the exchange-client flow and the localhost proxy path used during development.',
    'zh-CN': '演示 Sheets 插件模式下的导入导出，包括 exchange-client 链路以及开发期 localhost 代理下载路径。',
    'zh-TW': '演示 Sheets 外掛模式下的匯入匯出，包括 exchange-client 鏈路以及開發期間 localhost 代理下載路徑。',
    'ja-JP':
      'Sheets のプラグインモードにおけるインポート/エクスポートを演示し、exchange-client の経路と開発時の localhost ダウンロードプロキシを示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Univer SDK Pro', 'Plugin Mode', 'Import & Export'],
    'zh-CN': ['Univer Sheets', 'Univer SDK Pro', '插件模式', '导入导出'],
    'zh-TW': ['Univer Sheets', 'Univer SDK Pro', '外掛模式', '匯入匯出'],
    'ja-JP': ['Univer Sheets', 'Univer SDK Pro', 'プラグインモード', 'インポート/エクスポート'],
  },
}

export const files = {
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/config.ts': fs.readFileSync(path.resolve(__dirname, './code/config.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
  '/src/function.ts': fs.readFileSync(path.resolve(__dirname, './code/function.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
