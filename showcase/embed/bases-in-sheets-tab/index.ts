import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Tab', 'zh-CN': 'Sheets 宿主 / 标签嵌入' },
  title: {
    'en-US': 'Base in Sheets / Supplier Operations Tab',
    'zh-CN': 'Base 嵌入 Sheets / 供应商运营标签',
  },
  description: {
    'en-US':
      'A landed-cost workbook opens a native Base tab with supplier terms, review dates and linked follow-up records. Cost and operational decisions remain separate.',
    'zh-CN': '到岸成本工作簿内置原生 Base 标签，包含供应商条款、复核日期和关联跟进记录，区分成本计算与执行决策。',
  },
  tags: {
    'en-US': ['Embed', 'Sheets', 'Bases', 'Tab'],
    'zh-CN': ['嵌入', '表格', '多维表格', '标签'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets-ui',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getBase()',
    'FBase.getTableById()',
    'FBaseTableRecord.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Willow plans 3,500 items from six fictional suppliers, with a $38,985 landed-cost estimate. The native Supplier operations tab contains a full Base with a supplier directory and eight linked follow-ups; Release checks records unresolved gates. Wine, sand and sage accents distinguish this story from Atlas.',
      'zh-CN':
        'Willow 向六家虚构供应商采购 3,500 件商品，到岸成本估算为 38,985 美元。原生 Supplier operations 标签包含完整 Base 的供应商目录和八项关联跟进；Release checks 工作表说明未完成关卡。本例采用酒红、沙色和鼠尾草绿，与 Atlas 区分。',
    },
    tryIt: {
      'en-US': [
        'Compare quoted goods, freight and handling in Landed cost.',
        'Open Supplier operations and inspect the native Suppliers and Follow-ups tables.',
        'Edit a supplier name or a follow-up through native Base controls, then return to the workbook.',
        'Change E5 freight from 450 to 600. G12 rises to 39135 and Release checks updates; Base records remain independent.',
      ],
      'zh-CN': [
        '在 Landed cost 比较货值、运费与处理费。',
        '打开 Supplier operations，查看原生 Suppliers 与 Follow-ups 数据表。',
        '使用 Base 原生操作修改供应商名称或跟进记录，再返回工作簿。',
        '将 E5 运费从 450 改为 600，G12 增至 39135，Release checks 同步更新；Base 记录保持独立。',
      ],
    },
    expected: {
      'en-US':
        'Native tab and table navigation preserve Base edits. Linked follow-ups reference supplier IDs rather than duplicating names. All quotes are authored USD estimates; no tax, duty or currency engine is provided. Reload loses edits. History, lifecycle, accessibility, performance and export integration remain under verification. There is no backend or Exchange/Print workflow.',
      'zh-CN':
        '原生工作簿标签与数据表切换应保留 Base 修改。跟进记录通过供应商 ID 关联，而不是复制名称。报价均为预设美元估算，不提供税费、关税或汇率计算。刷新丢失修改；撤销归属、生命周期、可访问性、性能及导出集成仍在验证。不提供后端或 Exchange/Print 流程。',
    },
  },
  variants: [
    { id: 'cost', label: { 'en-US': 'Landed-cost model / Wine and sand', 'zh-CN': '到岸成本模型 / 酒红与沙色' } },
    {
      id: 'suppliers',
      label: {
        'en-US': 'Supplier directory / Native Base tab',
        'zh-CN': '供应商目录 / 原生 Base 标签',
      },
    },
    { id: 'followups', label: { 'en-US': 'Linked follow-ups / Record relationships', 'zh-CN': '关联跟进 / 记录关系' } },
  ],
  actions: [
    {
      id: 'navigate',
      label: {
        'en-US': 'Navigate native workbook tabs and Bases',
        'zh-CN': '切换原生工作簿标签与 Base 数据表',
      },
    },
    { id: 'edit', label: { 'en-US': 'Edit independent supplier records', 'zh-CN': '编辑独立供应商记录' } },
    { id: 'recalculate', label: { 'en-US': 'Recalculate freight and landed costs', 'zh-CN': '重算运费与到岸成本' } },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Cost and release worksheets', 'zh-CN': '成本与放行检查工作表' } },
    { id: 'child', label: { 'en-US': 'Native Supplier operations tab', 'zh-CN': '原生供应商运营标签' } },
    { id: 'error', label: { 'en-US': 'Source failure / reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
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
