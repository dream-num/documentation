import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-dynamic-array-formulas.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Dynamic Array Formulas', 'zh-CN': '动态数组公式' },
  description: {
    'en-US':
      'One formula, many cells: compare direct range spilling, FILTER, SORT, UNIQUE, SEQUENCE and blocked-spill recovery in three native worksheets.',
    'zh-CN':
      '一个公式自动展开多个单元格：用三张原生工作表对比区域展开、FILTER、SORT、UNIQUE、SEQUENCE 和溢出冲突恢复。',
  },
  tags: {
    'en-US': ['Formula', 'Dynamic array', 'Spill', 'FILTER', 'UNIQUE'],
    'zh-CN': ['公式', '动态数组', '溢出', 'FILTER', 'UNIQUE'],
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/engine-formula'],
  apis: [
    { name: 'FRange.setValue() / getValues() / getFormulas()' },
    { name: 'FFormula.onCalculationResultApplied()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Range spill begins with exactly =A1:B10 at D1. All output values come from the SDK formula engine. Amber cells are source inputs; green cells mark formula anchors. No host arithmetic or repeated cell formulas.',
      'zh-CN':
        'Range spill 在 D1 仅输入 =A1:B10。输出来自 SDK 公式引擎；琥珀色是源输入，绿色标记公式锚点。不使用宿主计算或逐格复制公式。',
    },
    tryIt: {
      'en-US': [
        'Edit B3 in Range spill and watch E3 update.',
        'In Filter and sort, change F2 between North, West, South and Missing; compare the spill sizes.',
        'Compare the live sorted output, unique regions and 3 × 3 sequence.',
        'In Spill boundaries, clear F5 to remove the intentional obstacle. Change A4 to =SEQUENCE(2,2) and inspect the dependent sum at A13.',
      ],
      'zh-CN': [
        '在 Range spill 编辑 B3，观察 E3 联动。',
        '在 Filter and sort 将 F2 改为 North、West、South 或 Missing，对比展开结果大小。',
        '对比实时排序结果、区域去重和 3 × 3 序列。',
        '在 Spill boundaries 清除 F5 的刻意阻挡，再将 A4 改成 =SEQUENCE(2,2)，检查 A13 的依赖求和。',
      ],
    },
    expected: {
      'en-US':
        'Edit source cells or formula anchors through the native Grid. A blocked spill must preserve the occupying value. All UI, source data and README instructions are English; preview/export share the complete Core preset locale and official CSS. No backend or external function is involved.',
      'zh-CN':
        '通过原生 Grid 编辑源单元格或公式锚点；被阻挡的展开不能覆盖已有值。界面、数据与 README 为英文，预览和导出共享完整 Core 语言包及官方 CSS；无需后端或外部函数。',
    },
  },
  variants: [
    {
      id: 'range',
      label: { 'en-US': 'Direct range spill', 'zh-CN': '区域直接展开' },
      description: {
        'en-US': 'D1 holds =A1:B10; one anchor returns two columns and ten rows.',
        'zh-CN': 'D1 的 =A1:B10 由一个锚点返回两列十行。',
      },
    },
    {
      id: 'filter',
      label: { 'en-US': 'FILTER / changing result size', 'zh-CN': 'FILTER / 动态结果大小' },
      description: {
        'en-US': 'Change F2 to return four, three, two or no matching routes; old spill cells must clear.',
        'zh-CN': '修改 F2 返回四、三、两条或无匹配线路；旧结果区域应清除。',
      },
    },
    {
      id: 'sort',
      label: { 'en-US': 'SORT / live ranking', 'zh-CN': 'SORT / 实时排序' },
      description: {
        'en-US': 'One SORT formula ranks the three-column source by load count.',
        'zh-CN': '一个 SORT 公式按载荷对三列源数据排序。',
      },
    },
    {
      id: 'unique',
      label: { 'en-US': 'UNIQUE / deduplicated regions', 'zh-CN': 'UNIQUE / 区域去重' },
      description: {
        'en-US': 'Nine repeated region entries produce three distinct results.',
        'zh-CN': '九条重复区域值返回三个不同结果。',
      },
    },
    {
      id: 'sequence',
      label: { 'en-US': 'SEQUENCE / generated matrix', 'zh-CN': 'SEQUENCE / 生成矩阵' },
      description: {
        'en-US': 'A 3 × 3 sequence uses start 10 and step 5; no host-generated values.',
        'zh-CN': '3 × 3 序列起始为 10、步长为 5，不使用宿主生成结果。',
      },
    },
    {
      id: 'collision',
      label: { 'en-US': 'Blocked spill / recover in place', 'zh-CN': '溢出冲突 / 原地恢复' },
      description: {
        'en-US': 'Occupied F5 blocks E4. Clear it with native Delete; keep the anchor formula intact.',
        'zh-CN': 'F5 已有值阻挡 E4 展开；原生 Delete 清除后恢复，锚点公式保持不变。',
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
