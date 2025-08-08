import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Watermark',
    'zh-CN': '水印',
    'ja-JP': 'ウォーターマーク',
  },
  description: {
    'en-US': 'This example demonstrates how to add a watermark to Univer Docs. The watermark can be customized with different text and styles.',
    'zh-CN': '此示例演示了如何在 Univer Docs 中添加水印。水印可以使用不同的文本和样式进行自定义。',
    'ja-JP': 'この例では、Univer Docs にウォーターマークを追加する方法を示します。ウォーターマークは、異なるテキストやスタイルでカスタマイズできます。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
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
