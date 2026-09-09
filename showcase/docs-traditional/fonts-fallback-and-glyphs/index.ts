import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Fonts, Fallback, and Glyphs', 'zh-CN': '字体、回退与字形' },
  description: {
    'en-US': 'Compare four font stacks and six script specimens directly in the native editor.',
    'zh-CN': '在原生编辑器中直接对照四种字体栈及六类文字样本。',
  },
  tags: { 'en-US': ['Traditional Docs', 'Fonts', 'Fallback'], 'zh-CN': ['传统文档', '字体', '回退'] },
  packages: ['@univerjs/preset-docs-core'],
  apis: [
    { name: 'FUniver.createDocument()' },
    { name: 'FDocument.getTextRange() / save()' },
    { name: 'FDocumentTextRange.getCommonExplicitTextStyle()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two authored pages compare sans, serif, monospace and missing-primary stacks, then multilingual glyph boundaries. All specimens are native editable text.',
      'zh-CN': '两页样张先对照无衬线、衬线、等宽和缺失首选字体栈，再展示多语言字形边界。全部是原生可编辑文字。',
    },
    tryIt: {
      'en-US': [
        'Compare regular 12 pt and bold 18 pt for each stack on the first page.',
        'Select a phrase and change its family, size or weight using the native Grid ribbon.',
        'Scroll to the next page to inspect CJK, RTL, accents, symbols and the private-use character.',
      ],
      'zh-CN': [
        '比较第一页各字体栈的 12 点常规与 18 点粗体。',
        '选择文字，用原生 Grid 工具栏修改字体、字号或粗细。',
        '滚动至下一页检查 CJK、RTL、重音、符号与私用字符。',
      ],
    },
    expected: {
      'en-US':
        'No external fonts or coverage probes. Requested stacks do not identify per-glyph fallback; RTL and missing glyphs need platform-specific visual acceptance. Font-size edits can repaginate the document. Theme changes retain edits.',
      'zh-CN':
        '不下载外部字体或探测字形覆盖。请求字体栈不证明逐字形回退；RTL 和缺字需逐平台视觉验收。字号编辑可能重新分页，主题切换保留编辑。',
    },
  },
  variants: [
    {
      id: 'families',
      label: { 'en-US': 'Four font stacks', 'zh-CN': '四种字体栈' },
      description: {
        'en-US': 'Arial, Georgia, Courier New and an absent primary with explicit fallback.',
        'zh-CN': 'Arial、Georgia、Courier New 及带显式回退的缺失首选字体。',
      },
    },
    {
      id: 'weight-size',
      label: { 'en-US': 'Size and weight', 'zh-CN': '字号与粗细' },
      description: {
        'en-US': 'Regular 12 pt and bold 18 pt compare actual native text runs.',
        'zh-CN': '通过真实原生文字段对照 12 点常规和 18 点粗体。',
      },
    },
    {
      id: 'scripts',
      label: { 'en-US': 'Script boundaries', 'zh-CN': '文字边界' },
      description: {
        'en-US': 'Latin, CJK, Arabic/Hebrew, accents, symbols and U+10FFFD.',
        'zh-CN': '拉丁文、CJK、阿拉伯文／希伯来文、重音、符号和 U+10FFFD。',
      },
    },
  ],
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
