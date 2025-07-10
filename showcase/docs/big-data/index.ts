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
    'en-US': 'Univer Docs supports rendering large datasets efficiently. This example demonstrates how to render large data in Univer Docs using preset mode.',
    'zh-CN': 'Univer Docs 支持高效渲染大数据集。这个示例演示了如何在预设模式中进行 Univer Docs 中的大数据渲染。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
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
