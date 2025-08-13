import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Menu',
    'zh-CN': '自定义菜单',
    'zh-TW': '自訂選單',
    'ja-JP': 'カスタムメニュー',
  },
  description: {
    'en-US': 'Custom plugins are a way to create custom menus, including toolbars and context menu. By customizing the menu, you can add your own functional buttons to enhance user interaction.',
    'zh-CN': '自定义插件是创建自定义菜单（包括工具栏和右键上下文菜单）的一种方式。通过自定义菜单，你可以添加自己的功能按钮，增强用户交互体验。',
    'zh-TW': '自訂插件是創建自訂選單（包括工具列和右鍵上下文選單）的一種方式。透過自訂選單，你可以添加自己的功能按鈕，增強使用者互動體驗。',
    'ja-JP': 'カスタムプラグインは、ツールバーやコンテキストメニューを含むカスタムメニューを作成する方法です。メニューをカスタマイズすることで、ユーザーインタラクションを強化するための独自の機能ボタンを追加できます。',
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
  '/src/menu-plugin/commands/dropdown-list.operation.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/commands/dropdown-list.operation.ts'), 'utf-8'),
  '/src/menu-plugin/commands/single-button.operation.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/commands/single-button.operation.ts'), 'utf-8'),
  '/src/menu-plugin/components/button-icon.tsx': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/components/button-icon.tsx'), 'utf-8'),
  '/src/menu-plugin/components/item-icon.tsx': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/components/item-icon.tsx'), 'utf-8'),
  '/src/menu-plugin/components/main-button-icon.tsx': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/components/main-button-icon.tsx'), 'utf-8'),
  '/src/menu-plugin/controllers/menu/dropdown-list.menu.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/controllers/menu/dropdown-list.menu.ts'), 'utf-8'),
  '/src/menu-plugin/controllers/menu/single-button.menu.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/controllers/menu/single-button.menu.ts'), 'utf-8'),
  '/src/menu-plugin/controllers/custom-menu.controller.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/controllers/custom-menu.controller.ts'), 'utf-8'),
  '/src/menu-plugin/locale/en-US.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/locale/en-US.ts'), 'utf-8'),
  '/src/menu-plugin/locale/zh-CN.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/locale/zh-CN.ts'), 'utf-8'),
  '/src/menu-plugin/plugin.ts': fs.readFileSync(path.resolve(__dirname, './code/menu-plugin/plugin.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
