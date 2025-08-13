import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Stress Test',
    'zh-CN': '压力测试（大数据量渲染）',
    'zh-TW': '壓力測試（大數據量渲染）',
    'ja-JP': 'ストレステスト',
  },
  description: {
    'en-US': 'Univer Sheets supports rendering large datasets efficiently. This example demonstrates how to handle big data rendering in a spreadsheet, ensuring smooth performance even with extensive data.',
    'zh-CN': 'Univer Sheets 支持高效渲染大数据集。这个示例演示了如何在电子表格中处理大数据渲染，即使在处理大量数据时也能确保流畅的性能。',
    'zh-TW': 'Univer Sheets 支持高效渲染大數據集。這個示例演示了如何在電子表格中處理大數據渲染，即使在處理大量數據時也能確保流暢的性能。',
    'ja-JP': 'Univer Sheets は、大規模データセットを効率的にレンダリングすることをサポートしています。この例では、スプレッドシートでの大規模データレンダリングを処理する方法を示し、膨大なデータを扱う際にもスムーズなパフォーマンスを確保します。',
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
