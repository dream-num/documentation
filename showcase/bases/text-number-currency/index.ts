import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Field types', 'zh-CN': '字段类型' },
  title: { 'en-US': 'Text, Number and Currency Fields', 'zh-CN': '文本、数字与货币字段' },
  description: {
    'en-US':
      'Explore field creation, numeric formatting, typed writes, defaults and schema conversion in a three-table repair café with 60 varied records.',
    'zh-CN': '在修理咖啡馆的三张表、60 条多样记录中，逐项演示字段创建、数值格式、类型化写入、默认值与类型转换。',
  },
  tags: {
    'en-US': ['Bases', 'Field types', 'Defaults', 'Conversion'],
    'zh-CN': ['多维表格', '字段类型', '默认值', '类型转换'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    'FUniver.createBase()',
    'FBaseTable.addField()',
    'FBaseTableField.getField()',
    'FBaseTableField.getConfig()',
    'FBaseTableField.setConfig()',
    'FBaseTableField.changeType()',
    'FBaseTableField.setDefaultValue()',
    'FBaseTableField.getDefaultValue()',
    'FBaseTableRecord.setValue()',
    'FBaseTableRecord.getValue()',
    'FBaseTable.addRecord()',
    'FBase.save()',
    'FUniver.undo() / redo()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Bracken repair café has 30 distinct repair jobs, 12 workshop projects and 18 return checks. Parts units and reserves are stored as numbers; submitted quotes intentionally include numeric strings, blanks and unparseable text. Unicode notes, people, canonical dates, original local attachments and real linked records provide varied context. The native Base Grid, its product-specific toolbar and four official SDK stylesheets are shared by Preview and the independent export.',
      'zh-CN':
        'Bracken 修理咖啡馆包含 30 个不同维修任务、12 个工作坊项目及 18 个归还检查。零件数量和预留金额以数字存储；提交报价有意包含数字字符串、空白及不可解析文本。多语言备注、人员、规范日期、原创本地附件和真实关联记录提供不同数据场景。预览与独立导出共用原生 Base Grid、产品专用工具栏和四份官方 SDK 样式。',
    },
    tryIt: {
      'en-US': [
        'Edit Parts units and Reserve directly in the native Grid; use native field menus for schema and display settings.',
        'Compare numeric storage with submitted quote strings, nulls, negative adjustments and multilingual notes.',
        'Use the 23 executable README Facade examples for field creation, all numeric format variants, defaults, conversion and diagnostic probes.',
        'Navigate the native left sidebar to Workshop projects and Return checks; all 60 original records and record links remain.',
        'Use the native ribbon for local Undo/Redo. Reconstruct a saved snapshot or a separate Empty, Boundary or Error dataset in the application entry.',
        'Change language or theme without recreating the owner or discarding edited data.',
      ],
      'zh-CN': [
        '直接在原生 Grid 编辑零件数量和预留金额；通过原生字段菜单调整结构与显示格式。',
        '比较数字存储与报价字符串、空值、负数调整和多语言备注。',
        'README 的 23 个可执行 Facade 示例涵盖字段创建、所有数字格式变体、默认值、类型转换与诊断。',
        '原生左侧栏可切换工作坊项目和归还检查，保留全部 60 条原创记录与关联。',
        '使用原生菜单撤销/重做；在应用入口恢复快照或构建空白、边界、错误数据变体。',
        '语言与主题切换不重建实例，不丢失已编辑数据。',
      ],
    },
    expected: {
      'en-US':
        'Only the native editor occupies the preview. Readbacks and diagnostics are executable source examples, not duplicate host panels. Schema conversion retains old strings, unsafe numeric defaults can be accepted, and numeric null can render as zero in beta.2; all remain strict acceptance gaps. Full EN/ZH packs and four official CSS imports accompany the source. No backend, upload, Office conversion or collaboration history is claimed.',
      'zh-CN':
        '预览仅包含原生编辑器；数据回读与诊断放在可执行源码示例，不添加重复宿主面板。beta.2 类型转换保留旧字符串、可能接受非法数字默认值，还可能将数字空值显示成零，这些仍是严格验收缺口。源码包含完整中英文包及四份官方 CSS，不宣称后端、上传、Office 转换或协作历史能力。',
    },
  },
  variants: [
    [
      'creation',
      'One field or three typed fields',
      '单字段或三个类型化字段',
      'Text, Number and Currency creation; old records are not backfilled.',
      '比较文本、数字、货币创建；不回填已有记录。',
    ],
    [
      'format',
      'Numeric display variants',
      '数字显示变体',
      '0–4 decimal places, four separators, grouping, K/M and display currency. Storage stays unchanged.',
      '0–4 位小数、四种分隔符、分组、K/M 与显示货币；存储值不变。',
    ],
    [
      'write',
      'Raw string, typed number or null',
      '原始字符串、数字或空值',
      'Compare SDK parsing/rejection with host finite-number checks and explicit null clearing.',
      '比较 SDK 解析/拒绝、宿主有限数检查与显式空值清除。',
    ],
    [
      'defaults',
      'Omitted, null and zero defaults',
      '省略、空值与零值',
      'Only omitted values inherit defaults. Safe typed defaults and unsafe raw SDK probes are separate.',
      '仅省略值继承默认值，区分安全类型化默认值和不安全的原始 SDK 测试。',
    ],
    [
      'conversion',
      'Schema change versus value normalization',
      '类型变化与值归一化',
      'Number/Currency retains amounts. Text-to-number currently retains old strings: inspect exact types before rewriting a cell.',
      '数字/货币保留金额；文本转数字目前保留旧字符串，重写前检查真实类型。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
  actions: [
    {
      id: 'native-edit',
      label: { 'en-US': 'Edit in the native Grid', 'zh-CN': '在原生 Grid 编辑' },
      description: {
        'en-US': 'Use native cells, field menus and local Undo/Redo. No duplicate demo buttons are added.',
        'zh-CN': '使用原生单元格、字段菜单和本地撤销/重做，不添加重复示例按钮。',
      },
    },
    {
      id: 'source-variants',
      label: { 'en-US': 'Run the documented Facade variants', 'zh-CN': '运行文档中的 Facade 变体' },
      description: {
        'en-US':
          'The README contains 23 executable field, formatting, default, conversion, download and navigation examples.',
        'zh-CN': 'README 包含 23 个可执行的字段、格式、默认值、转换、下载及导航示例。',
      },
    },
  ],
  states: [
    [
      'default',
      'Repair café / 60 records',
      '修理咖啡馆 / 60 条记录',
      '30 repair jobs, 12 workshop projects and 18 checks with different typed values.',
      '30 个维修任务、12 个项目及 18 个检查，类型化数据各不相同。',
    ],
    [
      'empty',
      'Empty repair intake',
      '空维修登记表',
      'Keep the schema and 30 supporting records; create a default-value probe to add the first repair.',
      '保留结构与 30 条上下文记录；通过默认值测试新增首条维修记录。',
    ],
    [
      'boundary',
      'Precision and multilingual text',
      '精度与多语言文本',
      '0.0001, 9999999.875 and long multilingual notes expose formatting versus storage.',
      '0.0001、9999999.875 和多语言长备注展示显示格式与存储的区别。',
    ],
    [
      'error',
      'Unparseable submitted quotes',
      '不可解析的报价',
      'Retain not a number, grouped numeric text and 12kg. Select Number conversion or a raw write to inspect SDK behavior.',
      '保留非法文本、带分组数字字符串和 12kg，通过数字转换或原始写入观察 SDK 行为。',
    ],
  ].map(([id, en, zh, den, dzh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': den, 'zh-CN': dzh },
  })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
