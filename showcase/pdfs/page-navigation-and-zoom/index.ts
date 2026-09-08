import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  image: '/assets/showcase/pdfs-page-navigation-and-zoom.png',
  group: { 'en-US': 'Navigation', 'zh-CN': '导航' },
  title: { 'en-US': 'Page navigation and zoom', 'zh-CN': '页面导航与缩放' },
  description: {
    'en-US': 'Compare native thumbnail fitting, footer page jumps and zoom presets across four page shapes.',
    'zh-CN': '使用四种页面比例对比原生缩略图适配、页码跳转与缩放预设。',
  },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-ui'],
  tags: { 'en-US': ['Navigation', 'Thumbnails', 'Zoom'], 'zh-CN': ['导航', '缩略图', '缩放'] },
  apis: ['FPdf.getPages()', 'FPdfPage.getData()', 'FPdf.save()'].map((name) => ({ name })),
  variants: [
    ['itinerary', 'Tall itinerary', '纵长行程'],
    ['route', 'Wide route', '横宽路线'],
    ['legend', 'Square key', '方形图例'],
    ['receipt', 'Narrow receipt', '窄幅清单'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
