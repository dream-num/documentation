import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/sheets-clipboard-and-paste-special.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Editing', 'zh-CN': '编辑' },
  title: { 'en-US': 'Clipboard and Paste Special', 'zh-CN': '剪贴板与选择性粘贴' },
  description: {
    'en-US': 'Compare native ordinary, value, formula and format paste with external text and HTML ingestion.',
    'zh-CN': '对比原生普通、数值、公式、格式粘贴，以及外部文本和 HTML 数据导入。',
  },
  tags: { 'en-US': ['Clipboard', 'Paste Special', 'Formulas'], 'zh-CN': ['剪贴板', '选择性粘贴', '公式'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FUniver.pasteIntoSheet()' }, { name: 'FRange.activate()' }],
  variants: [
    { id: 'values', label: { 'en-US': 'Values and formulas', 'zh-CN': '数值与公式' } },
    { id: 'formats', label: { 'en-US': 'Formats and widths', 'zh-CN': '格式与列宽' } },
    { id: 'external', label: { 'en-US': 'External clipboard', 'zh-CN': '外部剪贴板' } },
  ],
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
