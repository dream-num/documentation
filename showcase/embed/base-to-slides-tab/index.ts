import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Violet / Editorial Review', 'zh-CN': 'Violet / 编辑选题复盘' },
  description: {
    'en-US':
      'Eight Base articles drive thirteen native slide formulas: ready counts, weighted word coverage, section subtotals and editorial blockers.',
    'zh-CN': '八篇 Base 内容驱动十三个原生幻灯片公式：就绪篇数、字数覆盖率、栏目小计和编辑阻塞。',
  },
  tags: {
    'en-US': ['Formula', 'Bases', 'Slides', 'Tab', 'Embed'],
    'zh-CN': ['公式', '多维表格', '幻灯片', '页签', '嵌入'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/slides',
    '@univerjs-pro/embed',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/shape-editor',
  ],
  apis: [
    { name: 'FShape.setFormula()' },
    { name: 'FShape.getFormulaResult()' },
    { name: 'FBaseRecord.setValue()' },
    { name: 'FBase.setName()' },
    { name: 'FBaseTable.setName()' },
    { name: 'FBaseView.setFilter()' },
    { name: 'FUniver.setUIVisible()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional slow-living journal reviews eight articles. The native Base data page sits inside the Slides page list; thirteen Formula Shapes read the full table without a hidden Sheet or custom totals.',
      'zh-CN':
        '虚构慢生活刊物复盘八篇内容。原生 Base 数据页位于 Slides 页面列表内，十三个公式图形读取整张表，不使用隐藏 Sheet 或自算总计。',
    },
    tryIt: {
      'en-US': [
        'Open Editorial data in the native page list.',
        'Run the twelve literal README snippets in order.',
        'Compare ready-piece percentage with ready-word percentage.',
        'Filter Ready articles, then edit a hidden record and inspect all three result slides.',
      ],
      'zh-CN': [
        '在原生页面列表打开 Editorial data。',
        '依次执行 README 中十二段原样代码。',
        '比较就绪篇数占比与就绪字数占比。',
        '筛选就绪文章，再修改隐藏记录并检查三页结果。',
      ],
    },
    expected: {
      'en-US':
        'Initially 5 / 8 articles are Ready (62.5%), but only 4,400 / 8,200 words (53.66%) are Ready. Twelve examples and native source editing pass selected tests; complete persistence and delivery acceptance remain open. See README.',
      'zh-CN':
        '初始就绪篇数为 5 / 8（62.5%），就绪字数却是 4,400 / 8,200（53.66%）。十二段示例与原生来源编辑通过定向测试；完整持久化和交付验收仍未完成，详见 README。',
    },
  },
  variants: [
    { id: 'weight', label: { 'en-US': 'Record count / Word-weighted coverage', 'zh-CN': '记录计数 / 字数加权覆盖' } },
    {
      id: 'scope',
      label: { 'en-US': 'Whole table / Filtered view / Hidden source', 'zh-CN': '整表 / 筛选视图 / 隐藏来源' },
    },
    {
      id: 'identity',
      label: { 'en-US': 'Display labels / Stable formula identities', 'zh-CN': '显示名称 / 稳定公式标识' },
    },
    { id: 'empty', label: { 'en-US': 'Null / Zero / Zero-denominator recovery', 'zh-CN': '空值 / 零值 / 零分母恢复' } },
  ],
  actions: [
    { id: 'edit', label: { 'en-US': 'Edit native article status and words', 'zh-CN': '编辑原生文章状态和字数' } },
    { id: 'inspect', label: { 'en-US': 'Inspect all three dependent pages', 'zh-CN': '检查三页依赖结果' } },
    { id: 'recover', label: { 'en-US': 'Recover the original issue', 'zh-CN': '恢复原始刊物数据' } },
  ],
  states: [
    { id: 'live', label: { 'en-US': 'Live native results', 'zh-CN': '实时原生结果' } },
    { id: 'error', label: { 'en-US': 'Ratio error / Recovery', 'zh-CN': '比率错误 / 恢复' } },
    { id: 'load', label: { 'en-US': 'Source load failure / Reload', 'zh-CN': '来源加载失败 / 刷新' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/reference/preview-entry.ts.txt': './preview/index.ts',
})
export default { metadata, files, Preview }
