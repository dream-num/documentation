import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Read Only Demo',
    'zh-CN': '只读示例',
    'zh-TW': '只讀示例',
    'ja-JP': '読み取り専用デモ',
  },
  description: {
    'en-US': 'This example demonstrates how to set the workbook to read-only mode, hiding the toolbar, formula bar, footer, and disabling the context menu and selection features.',
    'zh-CN': '本示例演示了如何将工作簿设置为只读模式，并隐藏了工具栏、公式栏、页脚以及禁用右键菜单和选区功能。',
    'zh-TW': '本示例演示了如何將工作簿設置為只讀模式，並隱藏了工具欄、公式欄、頁腳以及禁用右鍵菜單和選區功能。',
    'ja-JP': 'この例では、ワークブックを読み取り専用モードに設定し、ツールバー、数式バー、フッターを非表示にし、コンテキストメニューと選択機能を無効にする方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
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
