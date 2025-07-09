import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Watermark',
    'zh-CN': '水印',
  },
  description: {
    'en-US': 'This example demonstrates how to add a watermark to Univer Docs. The watermark can be customized with different text and styles.',
    'zh-CN': '此示例演示了如何在 Univer Docs 中添加水印。水印可以使用不同的文本和样式进行自定义。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
