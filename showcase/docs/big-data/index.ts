import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Large documents', 'zh-CN': '大型文档' },
  packages: ['@univerjs/presets', '@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FUniver.Event.LifeCycleChanged / LifecycleStages.Steady' },
    { name: 'Univer.dispose()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Load a 1.1-million-character serialized document through the installed Docs Core Preset. This is a reproducible large-snapshot rendering case, not a benchmark result.',
      'zh-CN':
        '通过已安装的 Docs Core Preset 加载约 110 万字符的序列化文档。这是可复现的大快照渲染案例，不是性能基准结论。',
    },
    tryIt: {
      'en-US': [
        'Wait for the public Facade lifecycle to reach Steady before evaluating the initial large-document render.',
        'Scroll across distant pages and inspect paragraph, list and text-style continuity.',
        'Edit text through the native Docs UI and use native history; theme changes retain the owner and edits, while reloading starts from the original fixture.',
      ],
      'zh-CN': [
        '等待公开 Facade 生命周期进入 Steady，再评估大文档的首次渲染。',
        '滚动到相距较远的页面，检查段落、列表和文本样式的连续性。',
        '通过原生 Docs UI 编辑文本并使用原生历史；主题切换保留实例与编辑内容，重新加载会恢复原始 fixture。',
      ],
    },
    expected: {
      'en-US':
        'The original document snapshot renders in native Docs UI with official CSS. This case does not claim a load-time, memory, FPS or maximum-document guarantee until controlled measurements exist.',
      'zh-CN':
        '原始文档快照会在带官方 CSS 的原生 Docs UI 中渲染。在完成受控测量前，本例不承诺加载耗时、内存、FPS 或最大文档容量。',
    },
  },
  variants: [
    { id: 'snapshot', label: { 'en-US': '5.77 MB authored snapshot', 'zh-CN': '5.77 MB 源快照' } },
    { id: 'stream', label: { 'en-US': '1.1M-character data stream', 'zh-CN': '约 110 万字符数据流' } },
    { id: 'layout', label: { 'en-US': 'Multi-page paragraphs and styles', 'zh-CN': '多页段落与样式' } },
    { id: 'themes', label: { 'en-US': 'Light / dark SDK themes', 'zh-CN': 'SDK 明 / 暗主题' } },
  ],
  actions: [
    { id: 'load', label: { 'en-US': 'Create large document', 'zh-CN': '创建大型文档' } },
    { id: 'scroll', label: { 'en-US': 'Native long-range scrolling', 'zh-CN': '原生长距离滚动' } },
    { id: 'edit', label: { 'en-US': 'Native editing and history', 'zh-CN': '原生编辑与历史' } },
  ],
  states: [
    { id: 'loading', label: { 'en-US': 'Rendering lazy tasks', 'zh-CN': '正在渲染懒任务' } },
    { id: 'steady', label: { 'en-US': 'Facade Steady', 'zh-CN': 'Facade 已稳定' } },
    { id: 'edited', label: { 'en-US': 'User-edited document', 'zh-CN': '用户已编辑文档' } },
  ],
  title: {
    'en-US': 'Stress Test',
    'zh-CN': '压力测试（大数据量渲染）',
    'zh-TW': '壓力測試（大數據量渲染）',
    'ja-JP': 'ストレステスト（大規模データレンダリング）',
  },
  description: {
    'en-US':
      'Load and inspect a 1.1-million-character document snapshot in Preset mode without presenting an unmeasured performance claim.',
    'zh-CN': '在预设模式中加载并检查约 110 万字符的文档快照，不把未经测量的性能写成结论。',
    'zh-TW': '在預設模式中載入並檢查約 110 萬字元的文件快照，不把未經測量的效能寫成結論。',
    'ja-JP': '未計測の性能を断定せず、プリセットモードで約 110 万文字のドキュメントスナップショットを読み込みます。',
  },
  tags: {
    'en-US': ['Univer Docs', 'Preset Mode'],
    'zh-CN': ['Univer Docs', '预设模式'],
    'zh-TW': ['Univer Docs', '預設模式'],
    'ja-JP': ['Univer Docs', 'プリセットモード'],
  },
}

export const files = {
  '/reference/preview.tsx.txt': fs.readFileSync(path.resolve(__dirname, './preview/main.tsx'), 'utf-8'),
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/create-demo.ts': fs.readFileSync(path.resolve(__dirname, './code/create-demo.ts'), 'utf-8'),
  '/src/styles.css': fs.readFileSync(path.resolve(__dirname, './code/styles.css'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
