import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Text', 'zh-CN': '文字' },
  title: { 'en-US': 'Text boxes and typography', 'zh-CN': '文本框与文字样式' },
  description: {
    'en-US': 'Native editable text compares range emphasis, horizontal anchors and frame widths.',
    'zh-CN': '原生可编辑文本对比局部强调、水平锚定和文本框宽度。',
  },
  tags: { 'en-US': ['PDFs', 'Text', 'Typography'], 'zh-CN': ['PDF', '文本', '排版'] },
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
    'FPdfPage.insertTextBox()',
    'FPdfTextBox.setText()',
    'FPdfTextBox.setTextStyle()',
    'FPdfTextBox.setTextAnchor()',
    'FPdfPageElement.setSize()',
  ].map((name) => ({ name })),
  variants: [
    ['plain', 'Editable text', '可编辑文字'],
    ['range', 'Range emphasis', '局部强调'],
    ['anchor', 'Horizontal anchor', '水平锚定'],
    ['width', 'Frame widths', '文本框宽度'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [{ id: 'ready', label: { 'en-US': 'Native PDF ready', 'zh-CN': '原生 PDF 就绪' } }],
  guide: {
    overview: {
      'en-US': 'Two concise original pages compare native text objects without host controls.',
      'zh-CN': '两个简短原创页面比较原生文本对象，不添加宿主控件。',
    },
    tryIt: {
      'en-US': [
        'Use the native page rail to compare both pages.',
        'Use Text mode to revise the first sentence.',
        'Run the literal README recipes to compare text styles and widths.',
      ],
      'zh-CN': [
        '使用原生页栏比较两个页面。',
        '使用 Text 模式修改第一句话。',
        '执行 README 中的原样示例比较样式与宽度。',
      ],
    },
    expected: {
      'en-US':
        'Full English UI and official CSS. Native interaction and wrapping require visual acceptance. Callout leaders, binary conversion, OCR and printing are not claimed.',
      'zh-CN': '完整英文界面和官方 CSS；原生编辑和换行需视觉验收。不宣称引线标注、二进制转换、OCR 或打印。',
    },
  },
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
