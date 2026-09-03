import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  title: {
    'en-US': 'Custom Event',
    'zh-CN': '自定义事件',
    'zh-TW': '自定義事件',
    'ja-JP': 'カスタムイベント',
  },
  description: {
    'en-US':
      'Univer SDK supports registering custom events using the `univerAPI.registerEventHandler` and `univerAPI.fireEvent` methods. This example registers a main canvas right-click event, a before-remove-column event, and an after-remove-column event.',
    'zh-CN':
      'Univer SDK 支持使用 `univerAPI.registerEventHandler` 和 `univerAPI.fireEvent` 方法注册自定义事件，本示例注册了主画布右键事件、删除列前事件和删除列后事件。',
    'zh-TW':
      'Univer SDK 支援使用 `univerAPI.registerEventHandler` 和 `univerAPI.fireEvent` 方法註冊自定義事件，本範例註冊了主畫布右鍵事件、刪除列前事件和刪除列後事件。',
    'ja-JP':
      'Univer SDK は、`univerAPI.registerEventHandler` および `univerAPI.fireEvent` メソッドを使用してカスタムイベントを登録することをサポートしています。この例では、メインキャンバスの右クリックイベント、列削除前イベント、列削除後イベントを登録します。',
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
  '/src/custom-register-event.ts': fs.readFileSync(path.resolve(__dirname, './code/custom-register-event.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
