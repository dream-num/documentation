import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-outline.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Analysis', 'zh-CN': '数据分析' },
  title: { 'en-US': 'Row and column outlines', 'zh-CN': '行列分组与大纲' },
  description: {
    'en-US': 'Five native worksheets compare row groups, nesting, parent and child collapse, and nested column groups.',
    'zh-CN': '五张原生工作表比较行分组、嵌套、父子组折叠与嵌套列分组。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Outlines', 'Native gallery'], 'zh-CN': ['Univer Sheets', '大纲', '原生案例'] },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs-pro/license',
    '@univerjs-pro/sheets-outline',
    '@univerjs-pro/sheets-outline-ui',
  ],
  apis: [
    'FWorksheet.addRowOutline()',
    'FWorksheet.addColumnOutline()',
    'FWorksheet.getDimensionOutlines()',
    'FWorksheet.setDimensionOutlineCollapsed()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Each compact worksheet contains six equipment lines and real SUM/multiplication formulas. Independent sheets hold distinct outline states. All interaction stays in the native gutter, sheet tabs and Grid ribbon.',
      'zh-CN':
        '每张精简工作表包含六行设备与真实 SUM、乘法公式。各工作表独立保存不同大纲状态，交互全部使用原生大纲边栏、工作表标签与 Grid 功能区。',
    },
    tryIt: {
      'en-US': [
        'Switch native worksheet tabs to compare the five variants.',
        'Use the minus/plus controls in the row or column gutter to hide and reveal detail.',
        'Compare collapsed parent and collapsed child: the outer group controls the visibility of all descendants.',
        'Edit a cell and switch the site theme; the workbook and edits remain in the same instance.',
      ],
      'zh-CN': [
        '切换原生工作表标签，比较五种变体。',
        '使用行列大纲边栏的加减按钮隐藏或展开明细。',
        '对比父组与子组折叠：父组影响所有后代维度的可见性。',
        '编辑单元格后切换网站主题；同一实例保留工作簿与编辑。',
      ],
    },
    expected: {
      'en-US':
        'Native outline collapse changes dimension visibility, not cell data or formulas. Facade methods return the worksheet, not boolean success. Removing a group does not promise to unhide dimensions, adjacent groups may merge, and clearDimensionOutlines uses an inclusive end. See the exported README for these boundary recipes. Official CSS and both locale packs are included; native licensing remains visible.',
      'zh-CN':
        '原生大纲折叠只改变维度可见性，不修改单元格或公式。Facade 返回工作表而非成功布尔值。移除组不保证取消隐藏，相邻组可能合并，clearDimensionOutlines 使用包含式末端。导出 README 提供边界用法。包含官方 CSS 与英文语言包，保留原生许可提示。',
    },
  },
  variants: [
    ['rows', 'Row groups', '行分组'],
    ['nested', 'Nested rows', '嵌套行'],
    ['parent', 'Parent collapsed', '父组折叠'],
    ['child', 'Child collapsed', '子组折叠'],
    ['columns', 'Column groups', '列分组'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'sheet',
      'Switch native worksheet',
      '切换原生工作表',
      'Compare independent outline layouts using native sheet tabs.',
      '使用原生工作表标签比较独立的大纲布局。',
    ],
    [
      'toggle',
      'Expand or collapse',
      '展开或折叠',
      'Use the native outline gutter controls to change dimension visibility.',
      '使用原生大纲边栏改变维度可见性。',
    ],
    [
      'edit',
      'Edit a native cell',
      '编辑原生单元格',
      'Edit worksheet values while retaining the outline configuration.',
      '编辑工作表值并保留大纲设置。',
    ],
  ].map(([id, en, zh, enDescription, zhDescription]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': enDescription, 'zh-CN': zhDescription },
  })),
  states: [
    ['loading', 'Waiting for native outline plugins', '等待原生大纲插件'],
    ['ready', 'Five independent native outline specimens', '五种独立原生大纲样张'],
    ['collapsed', 'Native dimensions hidden; cells preserved', '原生维度隐藏，单元格保留'],
    ['edited', 'Edited workbook preserved across themes', '主题切换保留已编辑工作簿'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
