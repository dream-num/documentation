import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Charts and drawings', 'zh-CN': '图表与绘图' },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/preset-sheets-drawing',
    '@univerjs/preset-sheets-advanced',
  ],
  title: { 'en-US': 'Charts', 'zh-CN': '图表' },
  description: {
    'en-US': 'Compare six native chart variants and edit their worksheet sources directly.',
    'zh-CN': '对照六种原生图表变体，直接编辑工作表数据源。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Chart gallery'], 'zh-CN': ['Univer Sheets', '图表对照'] },
  apis: [
    { name: 'FWorksheet.newChart() / insertChart() / getCharts()' },
    {
      name: 'Chart builder: setSource() / setCategoryFields() / setValueFields() / setMultiLevelCategoryAxis() / setTheme() / setPalette() / setTitle() / setLegend() / setSize()',
    },
    { name: 'FUniver.registerTheme() / toggleDarkMode()' },
  ],
  variants: [
    ['column', 'Column', '柱形'],
    ['line', 'Line', '折线'],
    ['bar', 'Bar', '条形'],
    ['area', 'Area', '面积'],
    ['theme', 'Warm palette', '暖色主题'],
    ['multilevel', 'Station and quarter', '站点与季度'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    { id: 'linked', label: { 'en-US': 'Source-linked chart', 'zh-CN': '数据源关联图表' } },
    { id: 'missing', label: { 'en-US': 'Negative, zero and missing values', 'zh-CN': '负数、零与缺测值' } },
  ],
  guide: {
    overview: {
      'en-US':
        'Six native worksheets compare chart types, a warm theme, and a two-level category axis. The compact original monthly energy data includes negative, zero, decimal and missing readings. Matching values make type comparisons meaningful.',
      'zh-CN':
        '六个原生工作表对照图表类型、暖色主题与双层分类轴。简洁的原创月度能源数据包含负数、零、小数与缺测；一致的数据使图表类型对照更直观。',
    },
    tryIt: {
      'en-US': [
        'Switch the native worksheet tabs to compare Column, Line, Bar, Area, Warm palette and Station and quarter.',
        'Edit B4:D9 directly in the grid and observe the source-linked chart. Negative is net grid export; blank is not zero.',
        'On Station and quarter, edit C4:D11 to compare observed energy and budget across two stations and four quarters. Use native chart selection and menus for available settings.',
      ],
      'zh-CN': [
        '使用原生工作表标签切换柱形、折线、条形、面积、暖色主题及站点与季度。',
        '直接编辑 B4:D9，观察关联图表。负数表示电网外送，空白不等于零。',
        '在站点与季度工作表编辑 C4:D11，对照两个站点四个季度的实际与预算。通过原生图表选中及菜单访问可用设置。',
      ],
    },
    expected: {
      'en-US':
        'Preview and source export share the same factory, data and Core/Drawing/Advanced CSS. Complete English preset locales are included. Theme changes retain edits. The current unlicensed SDK rejects Area creation; its worksheet shows the failure while other variants remain usable. No substitute chart or license bypass is used. Coverage is partial; full-update history and other open checks are documented in README.',
      'zh-CN':
        '预览与源码导出共享工厂、数据及 Core/Drawing/Advanced CSS，包含完整英文预设语言包。切换主题保留编辑。当前未授权 SDK 拒绝创建面积图，对应工作表展示失败信息，其余变体继续可用；不使用替代图表或绕过授权。覆盖仍为部分，完整更新历史记录等待验收项见 README。',
    },
  },
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/function.ts': './code/function.ts',
  '/src/theme.json': './code/theme.json',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
