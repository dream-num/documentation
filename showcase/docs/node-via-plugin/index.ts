import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Running Headless Univer Docs in Node.js',
    'zh-CN': '在 Node.js 运行无头 Univer Docs',
  },
  description: {
    'en-US': 'This example demonstrates how to run Univer Docs in a Node.js environment using a plugin. It showcases the minimal setup required to create and manipulate a document without a UI.',
    'zh-CN': '本示例演示了如何在 Node.js 环境中使用插件运行 Univer Docs。它展示了在没有 UI 的情况下创建和操作文档所需的最小设置。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Plugin Mode'],
    'zh-CN': ['Univer Docs', '插件模式'],
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
