import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/pdfs-text-markup.png',
  product: 'pdfs',
  category: 'features',
  group: { 'en-US': 'Markup', 'zh-CN': '审阅标记' },
  title: { 'en-US': 'Highlight, Underline and Strikeout', 'zh-CN': '高亮、下划线与删除线' },
  description: {
    'en-US': 'Native PDF annotations review a renewal date, a fee and a two-line obsolete procedure.',
    'zh-CN': '使用原生 PDF 注释审阅续约日期、费用和双行旧流程。',
  },
  tags: { 'en-US': ['PDFs', 'Annotations', 'Review'], 'zh-CN': ['PDF', '注释', '审阅'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui'],
  apis: [
    'FPdfPage.insertAnnotation()',
    'FPdfPage.getAnnotations()',
    'FPdfAnnotation.setStyle()',
    'FPdfAnnotation.getMarkup()',
    'FPdfPageElement.remove()',
    'FPdf.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Aster is an original fictional two-page contract review. Native annotations preserve every source word; predefined quadrilaterals and native pointer highlighting demonstrate distinct paths.',
      'zh-CN': 'Aster 是原创虚构的两页合同审阅。原生注释保留源文字，预设四边形和原生拖选高亮分别展示两种路径。',
    },
    tryIt: {
      'en-US': [
        'Inspect the yellow renewal highlight and blue fee underline on page 1.',
        'Open page 2 using the native page rail to inspect the two-line strikeout.',
        'Select an annotation with the native selection tool and inspect its properties.',
        'Use the native Highlight tool to drag across a text line.',
        'Run the README variants to compare opacity boundaries, squiggly lines and a paired review mark.',
      ],
      'zh-CN': [
        '查看第一页黄色续约高亮和蓝色费用下划线。',
        '通过原生页面栏进入第二页查看双行删除线。',
        '使用原生选择工具选中注释并查看属性。',
        '使用原生高亮工具拖选一行文本。',
        '运行 README 变体，比较透明度边界、波浪线和跨区域标记。',
      ],
    },
    expected: {
      'en-US':
        'Only annotations change; words and the authored review date remain intact. Invalid opacity is rejected by the SDK. Native UI remains the sole toolbar, theme changes preserve edits, and the example makes no binary PDF conversion or Print claim. See README for strict acceptance boundaries.',
      'zh-CN':
        '仅修改注释，保留文字和审阅日期。SDK 拒绝无效透明度。原生 UI 是唯一工具栏，主题切换保留编辑；不宣称已完成二进制 PDF 转换或打印，严格验收边界见 README。',
    },
  },
  variants: [
    ['highlight', 'Renewal highlight', '续约高亮'],
    ['underline', 'Commercial underline', '商业条款下划线'],
    ['strikeout', 'Two-line strikeout', '双行删除线'],
    ['squiggly', 'Two-line discussion', '双行波浪线'],
    ['paired', 'Two separated targets', '跨区域目标'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native', 'Native select and highlight', '原生选择和高亮'],
    ['appearance', 'Color and opacity via Facade', 'Facade 颜色与透明度'],
    ['geometry', 'Multi-line annotation geometry', '多行注释几何'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['baseline', 'Three-mark comparison', '三种标记对比'],
    ['invisible', 'Invisible is not removed', '不可见不等于删除'],
    ['invalid', 'Rejected opacity preserves content', '拒绝透明度并保留内容'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
