import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/embed-mixed-in-bases.png',
  product: 'embed',
  category: 'showcases',
  previewHeight: 1000,
  group: { 'en-US': 'Relational Tables host / Mixed', 'zh-CN': 'Relational Tables 宿主 / 综合嵌入' },
  title: { 'en-US': 'Acorn / Complete Operating Workspace', 'zh-CN': 'Acorn / 完整运营工作区' },
  description: {
    'en-US':
      'A touring-exhibition studio combines linked opportunities, follow-ups and partners with native Sheet, Doc, Slides and Canvas tabs.',
    'zh-CN':
      '巡回展陈工作室将关联的机会、跟进任务与合作方，以及原生表格、文档、幻灯片和 Canvases Tab 组合在同一工作区。',
  },
  tags: {
    'en-US': ['Embed', 'Relational Tables', 'Tab', 'Sheets', 'Docs', 'Slides', 'Canvases'],
    'zh-CN': ['嵌入', 'Relational Tables', 'Tab', '表格', '文档', '幻灯片', 'Canvases'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
    '@univerjs/preset-sheets-advanced',
    '@univerjs/docs-ui',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/boards-ui',
  ],
  apis: [
    'FBaseTableRecord.setValue()',
    'FRange.setValue()',
    'FDocumentParagraph.appendText()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Ten opportunities, six linked follow-ups and four partner groups form the operating register. A two-sheet forecast exposes uncertainty; a playbook, three-slide review and bound-connector Canvas explain delivery. These are separate local models, not live CRM synchronization.',
      'zh-CN':
        '十个机会、六项关联跟进和四类合作方组成运营记录。两张工作表展示预测假设，手册、三页评审和关联连线 Canvases 说明交付过程。各产品数据独立，不代表 CRM 实时同步。',
    },
    tryIt: {
      'en-US': [
        'Browse the three Relational Tables and four native product tabs.',
        'Change Tidal Atlas value in Forecast; inspect the weighted total.',
        'Change a stage weight on Assumptions and compare its related opportunities.',
        'Run the five literal README examples after opening each product.',
      ],
      'zh-CN': [
        '浏览三个 Relational Table 表和四个原生产品 Tab。',
        '在 Forecast 修改 Tidal Atlas 金额，观察加权合计。',
        '在 Assumptions 修改阶段权重，对比相关机会。',
        '打开相应产品后运行 README 的五段原样示例。',
      ],
    },
    expected: {
      'en-US':
        'Five examples preserve model ownership. Selected typing, formulas, Print and export have evidence; first-Undo metadata equality and reselecting the active Sheet tab still fail. See README.',
      'zh-CN':
        '五段示例保持数据归属；选定输入、公式、打印和导出已有证据。首次撤销元数据一致性与重复点击当前 Sheet Tab 仍未通过，详见 README。',
    },
  },
  variants: [
    ['records', 'Linked operating records', '关联运营记录'],
    ['forecast', 'Two-sheet weighted forecast', '两张表组成的加权预测'],
    ['evidence', 'Narrative, review and process tabs', '说明、评审和流程 Tab'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    ['baseline', 'Illustrative operating baseline', '示意运营基线'],
    ['editing', 'Independent local edits', '独立本地编辑'],
    ['failure', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
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
