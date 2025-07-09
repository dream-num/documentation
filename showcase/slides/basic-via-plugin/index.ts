import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Minimal Example (Plugin Mode)',
    'zh-CN': '基础示例（插件模式）',
  },
  description: {
    'en-US': 'A minimal setup example for Univer Slides, demonstrating the minimum configuration required to use Univer Slides.',
    'zh-CN': 'Univer Slides 的基础配置示例，展示了使用 Univer Slides 所需的最小配置。',
  },
  tags: {
    'en-US': ['Univer Slides', 'Plugin Mode'],
    'zh-CN': ['Univer Slides', '插件模式'],
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
