import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/pdfs-create-load-viewer.png',
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Document lifecycle', 'zh-CN': '文档生命周期' },
  title: { 'en-US': 'Create and Load a PDF Viewer', 'zh-CN': '创建与加载 PDF 查看器' },
  description: {
    'en-US': 'Three native PDF pages compare portrait text, a landscape table and a square image.',
    'zh-CN': '三张原生 PDF 页面展示纵向文字、横向表格与方形图片。',
  },
  tags: { 'en-US': ['PDFs', 'Page gallery', 'Snapshots'], 'zh-CN': ['PDF', '页面图库', '快照'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/drawing-ui',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/license',
    '@univerjs-pro/pdfs',
    '@univerjs-pro/pdfs-editor',
    '@univerjs-pro/pdfs-ui',
  ],
  apis: [
    'FUniver.createPdf()',
    'FPdf.save() / getPages()',
    'FPdfPage.insertTextBox() / insertTable() / insertImage()',
    'FPdfTextBox.setText() / getText()',
    'createPdfDocument() / createPdfPage() / ptToEmu()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  variants: [
    ['portrait', 'Portrait text', '纵向文字'],
    ['landscape', 'Landscape table', '横向表格'],
    ['square', 'Square image', '方形图片'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [{ id: 'ready', label: { 'en-US': 'Native viewer ready', 'zh-CN': '原生查看器就绪' } }],
  guide: {
    overview: {
      'en-US':
        'A focused three-page PDF model built with SDK builders and Facades, with editable text, a small table and an original embedded SVG. No audit story or host lifecycle panel.',
      'zh-CN':
        '通过 SDK 构建器与 Facade 创建三页简洁 PDF 模型：可编辑文字、小表格与原创内嵌 SVG，没有审计故事或宿主生命周期面板。',
    },
    tryIt: {
      'en-US': [
        'Use native page thumbnails or the page-number field to navigate.',
        'Double-click the first page text to edit; use native PDF controls for available tools.',
        'Change the site theme: the same owner and edited content remain.',
      ],
      'zh-CN': [
        '使用原生缩略图或页码输入框切换页面。',
        '双击第一页文字编辑，通过原生 PDF 控件使用可用工具。',
        '切换网站主题，保留原实例与已编辑内容。',
      ],
    },
    expected: {
      'en-US':
        'Preview and download share the same factory, complete English UI packs and official CSS. Loading SDK snapshots is not binary PDF import. Installed PDF Exchange delegates to IExchangeService/HTTPService, so it is not enabled for this frontend-only example; no verified native PDF print plugin was found. Import, export and print remain unverified, not claimed from registration.',
      'zh-CN':
        '预览与下载共享工厂、完整英文语言包及官方 CSS。加载 SDK 快照并不是二进制 PDF 导入。当前 PDF Exchange 依赖 IExchangeService/HTTPService，本纯前端示例不启用；未找到经验证的原生 PDF 打印插件。导入、导出与打印仍未验收，不以注册作为通过依据。',
    },
  },
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
