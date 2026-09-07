import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Cross-workbook formulas', 'zh-CN': '跨工作簿公式' },
  description: {
    'en-US':
      'Trace live source edits through four local theatre workbooks, quoted references and transitive calculations.',
    'zh-CN': '在四本本地剧场工作簿中追踪来源编辑、带引号引用及链式计算。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Formulas', 'Facade'], 'zh-CN': ['Univer Sheets', '公式', 'Facade'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FUniver.createWorkbook() / getWorkbook() / getActiveWorkbook() / setCurrent() / disposeUnit()' },
    { name: 'FRange.setValue() / clearContent() / getValue() / getValues() / getRawValues() / getFormulas()' },
    {
      name: 'FFormula.executeCalculation() / calculationStart() / calculationEnd() / calculationResultApplied()',
    },
    { name: 'FWorkbook.save() / undo() / redo()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Tern touring theatre has ticket sales, travel costs, fictional FX/reserve assumptions and a summary. Zero attendance, decimal ticket prices, a negative credit and a separate Local Notes sheet make reference behavior visible. The source workbook IDs bind formulas; display names and file paths do not. All four workbooks share one local Univer formula engine. This is not an async host lookup function or an XLSX external-link updater.',
      'zh-CN':
        'Tern 巡演剧场包含票房、差旅费用、虚构换算/预留比例及汇总四本工作簿。零观众、小数票价、负数退款及独立 Local Notes 表用于观察引用行为。公式绑定来源工作簿 ID，而非显示名称或文件路径。四本工作簿共用一个本地 Univer 公式引擎，不等同于宿主异步查询函数或 XLSX 外部链接更新器。',
    },
    tryIt: {
      'en-US': [
        'Start in Tour Summary. Inspect each green formula and its actual value: total revenue 2700, travel costs 780, converted net 2400, after reserve 2160 and transitive converted costs 975.',
        'Use View to visit each workbook. Write North Hall tickets as 180 without leaving the summary, then inspect source D4, total revenue and the dependent summary. Source workbooks may calculate in the background.',
        'Compare six reference variants in Summary B4: a single cell, SUM of a source range, subtraction across two sources, same-workbook Local Notes and two missing-reference cases. The formula string and SDK result are both reported. Beta.2 returns #REF! for the missing workbook and #NAME? for the missing worksheet.',
        'Change FX, reserve, price or the negative refund. Zero is a numeric input; Clear source cell is blank; Set FX to text is a literal string. Compare their native arithmetic results and error propagation, then Restore FX.',
        'Unload the costs workbook and inspect dependent formulas. Restore uses its saved snapshot and original ID. This is a unit lifecycle operation, not Undo or a remote link fetch.',
        'Undo/Redo targets the workbook last edited by a host action. Native toolbar history uses the currently viewed workbook. Change view explicitly to compare these scopes.',
        'Save & reload all rebuilds the owning Univer, preserving loaded snapshots and IDs while clearing history. Reusing IDs inside the old owner would retain old history. Download all snapshots contains only loaded workbooks in JSON. Empty inputs clears source amounts while retaining calculation formulas. Reset restores the complete four-workbook fixture.',
      ],
      'zh-CN': [
        '从 Tour Summary 开始，对照绿色公式及真实结果：总票房 2700、费用 780、换算净额 2400、预留后 2160、链式换算费用 975。',
        '通过 View 访问每本工作簿。在汇总页将 North Hall 观众数写为 180，再检查来源 D4、总票房和汇总依赖；来源工作簿可在后台计算。',
        '比较汇总 B4 的六种引用：单格、来源区域 SUM、两个来源相减、本工作簿 Local Notes，以及两种缺失引用。回读同时显示公式字符串和 SDK 结果；beta.2 的缺失工作簿为 #REF!，缺失工作表为 #NAME?。',
        '修改换算参数、预留比例、票价或负退款。零是数值，Clear source cell 是空值，Set FX to text 是字面文本；对照真实运算及错误传播，再 Restore FX。',
        '卸载费用工作簿并检查依赖公式；恢复使用保存快照和原 ID。这是工作单元生命周期操作，不是撤销或远程链接获取。',
        '宿主 Undo/Redo 针对最近由宿主操作编辑的工作簿；原生工具栏历史针对当前显示工作簿。请切换视图比较作用域。',
        'Save & reload all 重建所属 Univer 实例，保留已加载快照及 ID，并清空历史；在旧实例中复用 ID 会保留旧历史。JSON 下载只包含已加载工作簿。Empty inputs 清空来源金额，保留计算公式；Reset 恢复完整四本数据。',
      ],
    },
    expected: {
      'en-US':
        'Readback uses public Facade values/formulas, with SDK calculation events reported separately. It does not precompute or replace results. Missing references, unloading/reloading and history are verified against the installed SDK, not assumed from other spreadsheet products. Source data is fictional and never fetched or uploaded. Arbitrary remote references, cross-instance references, XLSX external-link caches, async host functions and complete rename/delete/clipboard combinations are separate capabilities. Core CSS and the same implementation are included in Preview and source export.',
      'zh-CN':
        '回读使用公开 Facade 数值/公式，SDK 计算事件单独显示，不预计算或替换结果。缺失引用、卸载重载和历史以安装版本的实际表现为准，不假定其他表格产品的行为。数据虚构且不获取、不上传。任意远程引用、跨实例引用、XLSX 外部缓存、宿主异步函数及所有重命名/删除/剪贴板组合是独立能力。预览和源码导出共用实现及 Core CSS。',
    },
  },
  variants: [
    ['single', 'Single source cell', '单格来源'],
    ['range', 'SUM over an external range', '外部区域求和'],
    ['multiple', 'Two source workbooks', '两个来源工作簿'],
    ['chain', 'Transitive source calculation', '链式来源计算'],
    ['local', 'Same-workbook reference control', '同工作簿引用对照'],
    ['missing', 'Missing workbook or worksheet', '工作簿或工作表缺失'],
    ['input', 'Decimal, negative, zero and blank inputs', '小数、负数、零及空值'],
    ['error', 'Text input and dependent errors', '文本输入及错误传播'],
    ['lifecycle', 'Unload, restore and snapshot reload', '卸载、恢复及快照重载'],
    ['history', 'Per-workbook Undo and Redo', '按工作簿撤销与重做'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'view',
      'View workbook',
      '查看工作簿',
      'Use setCurrent with the existing source ID.',
      '通过 setCurrent 切换已有来源 ID。',
    ],
    [
      'write',
      'Write / clear source',
      '写入 / 清空来源',
      'Use setValue or clearContent on the selected source cell.',
      '对指定来源单元格调用 setValue 或 clearContent。',
    ],
    [
      'reference',
      'Apply reference variant',
      '应用引用变体',
      'Write a formula to Summary B4; inspect both expression and result.',
      '在汇总 B4 写入公式，并检查表达式与结果。',
    ],
    [
      'source',
      'Unload / restore costs',
      '卸载 / 恢复费用来源',
      'Save and dispose the source unit or recreate its snapshot.',
      '保存并释放来源单元，或用其快照重建。',
    ],
    [
      'history',
      'Undo / Redo',
      '撤销 / 重做',
      'Use the last host-edited workbook history.',
      '使用最近被宿主编辑的工作簿历史。',
    ],
    [
      'recalculate',
      'Recalculate / inspect',
      '重算 / 检查',
      'Request SDK calculation or read current Facade state.',
      '请求 SDK 计算或读取当前 Facade 状态。',
    ],
    [
      'snapshot',
      'Reload / download snapshots',
      '重载 / 下载快照',
      'Recreate loaded units or download their save() data as JSON.',
      '重建已加载单元，或下载 save() 的 JSON 数据。',
    ],
    [
      'reset',
      'Empty inputs / Reset',
      '清空输入 / 重置',
      'Recreate blank source inputs or the original four-workbook fixture.',
      '重建空白来源输入或原始四工作簿案例。',
    ],
  ].map(([id, en, zh, descriptionEn, descriptionZh]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': descriptionEn, 'zh-CN': descriptionZh },
  })),
  states: [
    ['ready', 'All sources loaded', '所有来源已加载'],
    ['calculating', 'SDK calculation in progress', 'SDK 正在计算'],
    ['modified', 'Edited source and dependent values', '来源及依赖结果已修改'],
    ['empty', 'Blank inputs with formulas retained', '空输入保留公式'],
    ['error', 'Invalid input or native formula error', '输入无效或原生公式错误'],
    ['unloaded', 'Costs source unloaded', '费用来源已卸载'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
