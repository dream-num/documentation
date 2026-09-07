import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Formula / Data-driven composition', 'zh-CN': 'Formula / 数据驱动组合' },
  title: { 'en-US': 'Aster / Research Results', 'zh-CN': 'Aster / 研究结果报告' },
  description: {
    'en-US':
      'A native Sheet drives ten inline formulas across a paginated research report: sample statistics, target comparisons and missing-value semantics.',
    'zh-CN': '原生 Sheet 驱动分页研究报告中的十个行内公式，展示样本统计、目标比较与缺失值语义。',
  },
  tags: {
    'en-US': ['Formula', 'Traditional Docs', 'Sheets', 'Inline', 'Embed'],
    'zh-CN': ['公式', '传统文档', '表格', '行内公式', '嵌入'],
  },
  packages: [
    '@univerjs-pro/docs-formula',
    '@univerjs-pro/docs-formula-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/embed',
  ],
  apis: [
    'FDocument.insertFormula()',
    'FDocument.getFormulas()',
    'FDocumentFormula.getResult()',
    'FRange.setValue()',
    'FRange.setValues()',
    'FRange.clearContent()',
    'FDocument.saveFormulaDisplayTextSnapshot()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Five fictional rebound observations feed the abstract and interpretation of a traditional A4 technical note. Its embedded Sheet, native formulas and authored narrative keep separate responsibilities; no JavaScript totals.',
      'zh-CN':
        '五条虚构回弹观测驱动传统 A4 技术报告的摘要与解读。嵌入 Sheet、原生公式和正文各自负责数据、计算与叙述，不用 JavaScript 拼接总数。',
    },
    tryIt: {
      'en-US': [
        'Read the summary, source chapter and interpretation.',
        'Run all nine literal README examples in order.',
        'Compare blank, zero and text inputs; clear and recover the sample.',
        'Inspect the native formula bindings and detached reading copy.',
      ],
      'zh-CN': [
        '阅读摘要、来源章节与结果解读。',
        '按顺序运行 README 九段原样代码。',
        '比较空白、零值与文本，并清空和恢复样本。',
        '检查原生公式绑定与独立阅读快照。',
      ],
    },
    expected: {
      'en-US':
        'Initial count 5, total 42.5 mm and mean 8.5 mm. Changing 7.5 to 10 gives total 45 and mean 9.0 on both report pages. Selected updates preserve three-page layout. Known SDK issue: empty-sample errors are displayed but reported as success. Partial; see README.',
      'zh-CN':
        '初始样本数 5、合计 42.5 毫米、均值 8.5 毫米。将 7.5 改为 10 后合计 45，两页报告中的均值均变为 9.0，选定修改保持三页布局。SDK 已知问题：空样本显示错误却报告 success。仅部分验收，详见 README。',
    },
  },
  variants: [
    ['sample', 'Sample statistics / Repeated references', '样本统计 / 重复引用'],
    ['target', 'Independent comparison target', '独立比较目标'],
    ['missing', 'Blank / Zero / Text / Empty sample', '空白 / 零值 / 文本 / 空样本'],
    ['projection', 'Live formulas / Detached reading copy', '实时公式 / 独立阅读快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['trial', 'Revise an observation', '修改观测值'],
    ['target', 'Change the target independently', '独立修改目标'],
    ['inspect', 'Inspect results and snapshots', '检查结果与快照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['live', 'Live statistics in paginated prose', '分页正文中的实时统计'],
    ['empty', 'Empty-sample errors / Recovery', '空样本错误 / 恢复'],
    ['failure', 'Source loading failure / Reload', '来源加载失败 / 刷新'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
