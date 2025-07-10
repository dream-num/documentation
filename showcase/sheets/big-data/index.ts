import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Big Data Rendering',
    'zh-CN': '大数据量渲染',
  },
  description: {
    'en-US': 'Univer Sheets supports rendering large datasets efficiently. This example demonstrates how to handle big data rendering in a spreadsheet, ensuring smooth performance even with extensive data.',
    'zh-CN': 'Univer Sheets 支持高效渲染大数据集。这个示例演示了如何在电子表格中处理大数据渲染，即使在处理大量数据时也能确保流畅的性能。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
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
