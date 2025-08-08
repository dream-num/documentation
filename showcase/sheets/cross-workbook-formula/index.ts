import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Cross Workbook Formula Calculation',
    'zh-CN': '跨表公式计算',
    'ja-JP': 'クロスワークブック数式計算',
  },
  description: {
    'en-US': 'This example demonstrates how to use Univer Sheets to calculate formulas across different workbooks, showcasing the flexibility and power of Univer Sheets in handling complex data operations.',
    'zh-CN': '本示例演示了如何使用 Univer Sheets 在不同工作簿之间计算公式，展示了 Univer Sheets 在处理复杂数据操作方面的灵活性和强大功能。',
    'ja-JP': 'この例では、Univer Sheets を使用して異なるワークブック間で数式を計算する方法を示し、複雑なデータ操作を処理する際の Unive Sheets の柔軟性と強力さを紹介します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = {
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/components/switch-units.tsx': fs.readFileSync(path.resolve(__dirname, './code/components/switch-units.tsx'), 'utf-8'),
  '/src/state.ts': fs.readFileSync(path.resolve(__dirname, './code/state.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
