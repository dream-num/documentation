import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  previewHeight: 1040,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Paragraph Bottom Borders and Shading', 'zh-CN': '段落底边与底纹' },
  description: {
    'en-US': 'Compare solid, dashed and dotted paragraph rules, width, padding, shading and their combination.',
    'zh-CN': '对比段落实线、虚线、点线底边，以及线宽、间距、底纹和组合效果。',
  },
  tags: { 'en-US': ['Paragraphs', 'Borders', 'Shading'], 'zh-CN': ['段落', '边框', '底纹'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [{ name: 'FDocument.getParagraphs()' }, { name: 'FDocumentParagraph.setStyle()' }],
  variants: [
    { id: 'line-patterns', label: { 'en-US': 'Solid, dashed and dotted rules', 'zh-CN': '实线、虚线与点线' } },
    { id: 'width-padding', label: { 'en-US': 'Rule width and padding', 'zh-CN': '线宽与间距' } },
    { id: 'shading', label: { 'en-US': 'Paragraph shading', 'zh-CN': '段落底纹' } },
    { id: 'combined', label: { 'en-US': 'Shading with bottom border', 'zh-CN': '底纹与底边组合' } },
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
