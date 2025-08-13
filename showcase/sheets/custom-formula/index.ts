import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Formula',
    'zh-CN': '自定义公式',
    'zh-TW': '自訂公式',
    'ja-JP': 'カスタム数式',
  },
  description: {
    'en-US': 'An example of using custom formulas in Univer Sheets. This example demonstrates how to create and use custom formulas to extend the functionality of spreadsheets.',
    'zh-CN': '在 Univer Sheets 中使用自定义公式的示例。这个示例展示了如何创建和使用自定义公式来扩展电子表格的功能。',
    'zh-TW': '在 Univer Sheets 中使用自訂公式的範例。此範例展示了如何建立和使用自訂公式來擴展電子表格的功能。',
    'ja-JP': 'Univer Sheets でカスタム数式を使用する例です。この例では、スプレッドシートの機能を拡張するためにカスタム数式を作成および使用する方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const customFunctionTs = fs.readFileSync(path.resolve(__dirname, './code/custom-function.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/custom-function.ts': customFunctionTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
