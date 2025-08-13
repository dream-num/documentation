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
    'ja-JP': 'ストレステスト（大規模データレンダリング）',
  },
  description: {
    'en-US': 'Univer Docs supports rendering large datasets efficiently. This example demonstrates how to render large data in Univer Docs using preset mode.',
    'zh-CN': 'Univer Docs 支持高效渲染大数据集。这个示例演示了如何在预设模式中进行 Univer Docs 中的大数据渲染。',
    'zh-TW': 'Univer Docs 支援高效渲染大數據集。這個示例演示了如何在預設模式中進行 Univer Docs 中的大數據渲染。',
    'ja-JP': 'Univer Docs は、大規模データセットを効率的にレンダリングすることをサポートしています。この例では、プリセットモードを使用して Univer Docs で大規模データをレンダリングする方法を示します。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
    'zh-TW': ['Univer Docs', '預設模式'],
    'ja-JP': ['Univer Docs', 'プリセットモード'],
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
