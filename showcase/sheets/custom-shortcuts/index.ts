import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Shortcuts',
    'zh-CN': '自定义快捷键',
  },
  description: {
    'en-US': 'This example demonstrates how to create and use custom shortcuts in Univer Sheets. It shows how to define shortcuts for common actions, enhancing user productivity.',
    'zh-CN': '这个示例演示了如何在 Univer Sheets 中创建和使用自定义快捷键。它展示了如何为常见操作定义快捷键，从而提高用户的工作效率。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
  },
}

const indexTs = fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8')
const pluginCustomCommandTs = fs.readFileSync(path.resolve(__dirname, './code/shortcuts-plugin/commands/custom.command.ts'), 'utf-8')
const pluginCustomShortcutTs = fs.readFileSync(path.resolve(__dirname, './code/shortcuts-plugin/controllers/custom.shortcut.ts'), 'utf-8')
const pluginTs = fs.readFileSync(path.resolve(__dirname, './code/shortcuts-plugin/plugin.ts'), 'utf-8')
const dataTs = fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8')

export const files = {
  '/src/index.ts': indexTs,
  '/src/shortcuts-plugin/commands/custom.command.ts': pluginCustomCommandTs,
  '/src/shortcuts-plugin/controllers/custom.shortcut.ts': pluginCustomShortcutTs,
  '/src/shortcuts-plugin/plugin.ts': pluginTs,
  '/src/data.ts': dataTs,
}

export default {
  metadata,
  files,
  Preview,
}
