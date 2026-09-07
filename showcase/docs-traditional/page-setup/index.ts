import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-traditional-page-setup.png',
  product: 'docs-traditional',
  category: 'features',
  group: { 'en-US': 'Page geometry', 'zh-CN': '页面几何' },
  title: { 'en-US': 'Page Size, Orientation, and Margins', 'zh-CN': '纸张尺寸、方向与页边距' },
  description: {
    'en-US':
      'Compare A4 portrait, A4 landscape, US Letter, and a custom field-guide page. Apply custom margins and inspect resolved dimensions from the SDK.',
    'zh-CN': '比较 A4 纵向、横向、US Letter 与自定义手册页面，调整页边距并从 SDK 回读实际尺寸。',
  },
  tags: {
    'en-US': ['Traditional Docs', 'Native page setup', 'Paginated layout'],
    'zh-CN': ['传统文档', '原生页面设置', '分页排版'],
  },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FDocumentSection.setPageSetup()' },
    { name: 'FDocumentSection.getEffectivePageSetup()' },
    { name: 'FDocument.undo()' },
    { name: 'FDocument.redo()' },
  ],
  previewHeight: 1040,
  guide: {
    overview: {
      'en-US':
        'Edit a fictional fourteen-paragraph Harbor field guide using the native paginated editor. The source README includes twelve literal Facade examples and complete owner recovery.',
      'zh-CN':
        '在原生分页编辑器中编辑十四段虚构 Harbor 手册。源码 README 提供十二段可运行 Facade 示例及完整 owner 恢复。',
    },
    tryIt: {
      'en-US': [
        'Open native Page setup to choose paper and margins; use the README for landscape and custom dimensions.',
        'Click the document, edit its narrative, and use native Undo/Redo.',
        'Run the README examples for compact paper, asymmetric binding space, and wide annotation margins.',
      ],
      'zh-CN': [
        '打开原生页面设置，选择纸张及页边距；横向和自定义尺寸请运行 README 示例。',
        '点击文档编辑正文，使用原生撤销和重做。',
        '运行 README 中的小册子纸张、不对称装订空间和批注宽页边距示例。',
      ],
    },
    expected: {
      'en-US':
        'Actual paper geometry and paragraph wrapping change together. Section overrides take precedence over document defaults. Invalid content areas are guarded in the application example, not claimed as universal SDK validation.',
      'zh-CN':
        '真实纸张尺寸与段落换行同步变化。分节设置优先于文档默认值。示例在调用前检查无效内容区域，不宣称 SDK 会拒绝所有无效输入。',
    },
  },
  variants: [
    { id: 'a4', label: { 'en-US': 'A4 portrait', 'zh-CN': 'A4 纵向' } },
    { id: 'landscape', label: { 'en-US': 'A4 landscape', 'zh-CN': 'A4 横向' } },
    { id: 'letter', label: { 'en-US': 'US Letter', 'zh-CN': 'US Letter 信纸' } },
    { id: 'custom', label: { 'en-US': 'Field guide · custom size', 'zh-CN': '手册 · 自定义纸张' } },
  ],
  actions: [
    { id: 'page-setup', label: { 'en-US': 'Native page setup', 'zh-CN': '原生页面设置' } },
    { id: 'undo', label: { 'en-US': 'Native undo', 'zh-CN': '原生撤销' } },
    { id: 'redo', label: { 'en-US': 'Native redo', 'zh-CN': '原生重做' } },
    { id: 'restore', label: { 'en-US': 'Full snapshot recipe', 'zh-CN': '完整快照恢复示例' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': 'Deterministic baseline', 'zh-CN': '确定性初始状态' } },
    { id: 'modified', label: { 'en-US': 'Modified model', 'zh-CN': '已修改模型' } },
    { id: 'error', label: { 'en-US': 'Visible operation error', 'zh-CN': '可见操作错误' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
