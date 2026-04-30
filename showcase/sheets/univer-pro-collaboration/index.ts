import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Collaboration',
    'zh-CN': '协同编辑',
    'zh-TW': '協同編輯',
    'ja-JP': '共同編集',
  },
  description: {
    'en-US': 'This example demonstrates how to enable collaborative editing in Univer Sheets, allowing multiple users to edit the same workbook and keep changes synchronized in real time.',
    'zh-CN': '本示例演示了如何在 Univer Sheets 中启用协同编辑，使多个用户可以同时编辑同一工作簿并实时同步更改。',
    'zh-TW': '本範例演示了如何在 Univer Sheets 中啟用協同編輯，使多個使用者可以同時編輯同一活頁簿並即時同步變更。',
    'ja-JP': 'この例では、Univer Sheets で共同編集を有効にし、複数のユーザーが同じワークブックを同時に編集して変更をリアルタイムに同期する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Univer Pro', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', 'Univer Pro', '插件模式'],
    'zh-TW': ['Univer Sheets', 'Univer Pro', '外掛模式'],
    'ja-JP': ['Univer Sheets', 'Univer Pro', 'プラグインモード'],
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
