import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Data quality', 'zh-CN': '数据质量' },
  title: { 'en-US': 'List Data Validation', 'zh-CN': '下拉列表数据验证' },
  description: {
    'en-US':
      'Compare single-select, multiple-select and editable range sources through native dropdowns. Chips, arrows and plain text appear side by side.',
    'zh-CN': '通过原生下拉菜单比较单选、多选和可编辑范围来源，并排查看标签、箭头及纯文本。',
  },
  tags: { 'en-US': ['Validation', 'Dropdown', 'Multi-select'], 'zh-CN': ['数据验证', '下拉列表', '多选'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-data-validation'],
  apis: [
    { name: 'FUniver.newDataValidation()' },
    { name: 'FDataValidationBuilder.requireValueInList() / requireValueInRange()' },
    { name: 'FDataValidationBuilder.setAllowBlank() / setAllowInvalid() / setOptions() / build()' },
    { name: 'FRange.setDataValidation()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Six fictional museum objects keep this feature example small. Switch native sheet tabs to compare list behaviors without a separate host panel. Both official preset styles and English locales are included in the exported source.',
      'zh-CN':
        '六件虚构藏品用于简单展示列表功能。切换原生工作表标签对比验证行为，不设置额外宿主面板。导出源码包含两份官方预设样式及完整英文语言包。',
    },
    tryIt: {
      'en-US': [
        'On Single and appearance, open B2’s native dropdown and choose Paper. Columns B, C and D use the same list with chips, arrows and plain text.',
        'Switch to Multiple materials and open B2. Toggle individual materials; the initial Paper and Textiles value uses SDK list serialization.',
        'Switch to Live source. Edit H2:H6, then reopen a B-column dropdown to inspect the changed options.',
        'Compare B4 (Unknown), B5 (explicit blank) and B7 (no stored value). Existing unknown values remain visible; blank values are allowed. Use the native Data validation menu to edit these rules.',
      ],
      'zh-CN': [
        '在“单选与外观”打开 B2 原生下拉菜单并选择“纸张”。B、C、D 列采用同一列表，分别显示标签、箭头及纯文本。',
        '切换“多选材质”，打开 B2 逐项勾选材质；初始“纸张”和“纺织品”使用 SDK 列表序列化格式。',
        '切换“动态来源”，修改 H2:H6，再打开 B 列下拉菜单查看选项变化。',
        '比较 B4（未知）、B5（显式空值）和 B7（未存储值）。未知值保留可见，允许空值；通过原生数据验证菜单编辑这些规则。',
      ],
    },
    expected: {
      'en-US':
        'Native dropdown edits update real cells. Unknown values are marked rather than cleaned automatically; all rules allow blank and invalid input. Theme changes retain edits. There are no fixture controls, JSON downloads or readback cards.',
      'zh-CN':
        '原生下拉操作更新实际单元格。未知值被标记而非自动清洗；所有初始规则允许空值及无效输入。切换主题保留编辑。不包含状态控制面板、JSON 下载或读回卡片。',
    },
  },
  variants: [
    {
      id: 'single',
      label: { 'en-US': 'Single selection and three appearances', 'zh-CN': '单选与三种外观' },
      description: {
        'en-US': 'B2:B7 chips, C2:C7 arrows, D2:D7 plain text; identical fixed options.',
        'zh-CN': 'B2:B7 标签、C2:C7 箭头、D2:D7 纯文本，采用相同固定选项。',
      },
    },
    {
      id: 'multiple',
      label: { 'en-US': 'Multiple materials', 'zh-CN': '多选材质' },
      description: {
        'en-US': 'B2:B7 accepts multiple list items per cell.',
        'zh-CN': 'B2:B7 每格可以选择多个列表项。',
      },
    },
    {
      id: 'source',
      label: { 'en-US': 'Editable range source', 'zh-CN': '可编辑范围来源' },
      description: {
        'en-US': 'B2:B7 references H2:H6 in the same worksheet.',
        'zh-CN': 'B2:B7 引用当前工作表 H2:H6。',
      },
    },
  ],
  actions: [],
  states: [
    {
      id: 'invalid',
      label: { 'en-US': 'Unknown material', 'zh-CN': '未知材质' },
      description: {
        'en-US': 'B4 starts outside the list and remains visible.',
        'zh-CN': 'B4 初始值不在列表中，仍保留可见。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'Blank and absent values', 'zh-CN': '空值和未存储值' },
      description: {
        'en-US': 'B5 is explicitly blank; B7 is absent. Both have validation rules and allow blank.',
        'zh-CN': 'B5 显式为空，B7 未存储值；两者均有规则并允许空值。',
      },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
