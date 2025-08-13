import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Crosshair Highlighting',
    'zh-CN': '十字高亮',
    'zh-TW': '十字高亮',
    'ja-JP': 'クロスヘアハイライト',
  },
  description: {
    'en-US': 'An example of crosshair highlighting in Univer Sheets, demonstrating how to highlight cells based on the current selection.',
    'zh-CN': 'Univer Sheets 中的十字高亮示例，展示了如何根据当前选择高亮显示单元格。',
    'zh-TW': 'Univer Sheets 中的十字高亮示例，展示了如何根據當前選擇高亮顯示單元格。',
    'ja-JP': 'Univer Sheets におけるクロスヘアハイライトの例であり、現在の選択に基づいてセルをハイライトする方法を示しています。',
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
