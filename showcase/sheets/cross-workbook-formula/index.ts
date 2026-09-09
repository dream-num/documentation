import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/sheets-cross-workbook-formula.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Cross-workbook formulas', 'zh-CN': '跨工作簿公式' },
  description: {
    'en-US': 'Six reference variants side by side, driven by edits in four local workbooks.',
    'zh-CN': '并排对照六种引用，通过四本本地工作簿中的原生编辑驱动结果。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Formulas', 'Facade'], 'zh-CN': ['Univer Sheets', '公式', 'Facade'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    'FUniver.createWorkbook() / getWorkbook() / setCurrent()',
    'FFormula.executeCalculation() / onCalculationResultApplied()',
    'FWorkbook.save()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  variants: [
    ['single', 'Single cell', '单个单元格'],
    ['range', 'External range SUM', '外部区域求和'],
    ['multiple', 'Two workbooks', '两个工作簿'],
    ['local', 'Same workbook', '同工作簿'],
    ['missing-workbook', 'Missing workbook', '缺失工作簿'],
    ['missing-sheet', 'Missing worksheet', '缺失工作表'],
    ['chain', 'Transitive calculation', '链式计算'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    {
      id: 'view',
      label: { 'en-US': 'View workbook', 'zh-CN': '查看工作簿' },
      description: {
        'en-US': 'setCurrent() selects an already loaded workbook; native sheet tabs navigate within it.',
        'zh-CN': 'setCurrent() 选择已加载工作簿，原生工作表标签负责簿内切换。',
      },
    },
  ],
  states: [
    { id: 'ready', label: { 'en-US': 'Four local sources loaded', 'zh-CN': '四本本地来源已加载' } },
    { id: 'error', label: { 'en-US': 'Native reference errors visible', 'zh-CN': '显示原生引用错误' } },
  ],
  guide: {
    overview: {
      'en-US':
        'The workbook picker is the only host control. Summary B4:B9 shows six formulas simultaneously, with expression text in column D. Yellow source cells are editable; green cells are native engine results. Rates also drives the transitive examples in B11:B12.',
      'zh-CN':
        '工作簿选择器是唯一宿主控件。汇总 B4:B9 同时展示六种公式，D 列显示表达式。黄色来源单元格可编辑，绿色单元格由原生引擎计算。换算参数也驱动 B11:B12 的链式示例。',
    },
    tryIt: {
      'en-US': [
        'In Sales, change B4 from 120 to 180 using the grid. Return to Summary: B4 becomes 2250, B5 becomes 3450 and B6 becomes 2670.',
        'Compare same-workbook, missing-workbook and missing-sheet references together. Beta.2 reports #REF! and #NAME? for the two missing targets.',
        'Change Rates B4 to see both direct and transitive dependencies. Theme changes retain all four edited workbooks.',
      ],
      'zh-CN': [
        '在销售工作簿中通过原生表格将 B4 从 120 改为 180。返回汇总，B4 变为 2250，B5 变为 3450，B6 变为 2670。',
        '同时对照同簿引用、缺失工作簿与缺失工作表。beta.2 对后两种分别返回 #REF! 与 #NAME?。',
        '修改换算参数 B4，观察直接与链式依赖。切换主题保留全部四本工作簿的编辑。',
      ],
    },
    expected: {
      'en-US':
        'Every value is calculated by the installed SDK, never by host arithmetic. Quoted references use workbook IDs plus English sheet names. Core CSS, complete English locales and the same factory are exported. This is a single local engine, not remote file fetching, cross-instance linking or XLSX external-link conversion. Coverage remains partial.',
      'zh-CN':
        '所有值均由已安装 SDK 计算，没有宿主算术替代。带引号引用使用工作簿 ID 和固定英文工作表名称。导出包含 Core CSS、完整英文语言包及同一工厂。此例使用同一本地引擎，不是远程文件获取、跨实例链接或 XLSX 外部链接转换。当前仍为部分覆盖。',
    },
  },
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
