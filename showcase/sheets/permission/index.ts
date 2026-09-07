import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Protection', 'zh-CN': '保护' },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FUniver.setProtectedRangeShadowStrategy() / getProtectedRangeShadowStrategy()' },
    {
      name: 'FWorksheetPermission.protect() / unprotect() / setPoint() / canEditCell() / canViewCell() / listRangeProtectionRules() / unprotectRules()',
    },
    { name: 'FRangePermission.protect() / FRangeProtectionRule.setPoint() / getSnapshot()' },
    { name: 'FRange.activate() / setValue() / clearContent() / getRawValues()' },
    { name: 'FWorkbook.save() / setActiveSheet()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Harbor repair café is an original six-workshop volunteer rota with decimal, zero and unassigned hours. Compare protection rules and shadow strategy independently. The initial worksheet remains read-only with no shadow; this preserves the original example while making its effect testable.',
      'zh-CN':
        'Harbor 维修咖啡馆是原创的六组志愿排班数据，包含小数、零和待分配工时。保护规则与阴影策略独立比较；初始工作表为无阴影的只读状态，保留原案例并让效果可验证。',
    },
    tryIt: {
      'en-US': [
        'Try editing C4 in the native editor. Whole worksheet protection blocks editing even with Shadow=None. The host Write button checks public canEditCell before changing data.',
        'Apply Always, Non-editable only, Non-viewable only and None. Inspect the actual strategy getter and compare native paint, not just the selected option.',
        'Compare six profiles: whole sheet read-only, C4:C9 read-only, not-viewable, protected-but-editable, mixed C4:C6 editable / C7:C9 read-only, and no protection. Applying a profile replaces existing rules on this demo worksheet without changing values.',
        'Select C4, zero C6, blank C8 or outside B4/E9. Compare canEditCell/canViewCell with native input. Hiding a shadow never grants edit permission.',
        'Switch to Unprotected notes and edit C4 independently. Inspect reads native rules and data; it does not calculate permission results itself.',
        'Download contains local workbook JSON, including locally loaded data. Empty removes hours but keeps the SUM formula; Reset restores the original rota and default protected/no-shadow state. Both rebuild the owner and clear history.',
      ],
      'zh-CN': [
        '尝试在原生编辑器修改 C4：整表保护即使无阴影也应阻止编辑。宿主写入按钮先检查公开 canEditCell。',
        '切换 Always、Non-editable only、Non-viewable only 和 None，通过策略 getter 及原生绘制对照效果，不只检查下拉框。',
        '比较整表只读、C4:C9 只读、不可查看、受保护但可编辑、C4:C6 可编辑与 C7:C9 只读混合，以及无保护六种模式。应用模式替换本例工作表现有规则但不改变数据。',
        '选择 C4、零值 C6、空值 C8 或范围外 B4/E9，对照 canEditCell/canViewCell 与原生输入。隐藏阴影不会授予编辑权限。',
        '切换 Unprotected notes，独立编辑其 C4。检查按钮读取原生规则与数据，不自行计算权限结果。',
        '下载包含本地加载数据的工作簿 JSON；Empty 清空工时但保留 SUM，Reset 恢复初始数据及无阴影整表保护。两者重建实例并清空历史。',
      ],
    },
    expected: {
      'en-US':
        'Frontend-only permission visualization is not server authorization or encryption. Developer readback and snapshots can still expose local values when View is false; do not use this example to distribute confidential data. No password, collaborator backend, permission-history or portable permission-snapshot guarantee is claimed. Preview and export share the same initialization, handlers, fixture and Core CSS.',
      'zh-CN':
        '纯前端权限展示不是服务端鉴权或加密。View=false 时，开发者回读和快照仍可包含本地数值；不要用本例分发保密数据。不承诺密码保护、协作者后端、权限历史或权限快照可移植性。预览和导出共享初始化、处理函数、数据及 Core CSS。',
    },
  },
  variants: [
    ['none-shadow', 'No shadow, protection retained', '无阴影且保留保护'],
    ['always', 'Always show protection', '始终展示保护'],
    ['edit-shadow', 'Only non-editable ranges', '仅不可编辑范围'],
    ['view-shadow', 'Only non-viewable ranges', '仅不可查看范围'],
    ['scope', 'Worksheet or range scope', '工作表或区域范围'],
    ['mixed', 'Mixed editable and locked ranges', '混合可编辑与锁定范围'],
    ['unprotected', 'Unprotected comparison', '无保护对照'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    [
      'profile',
      'Apply protection profile',
      '应用保护模式',
      'Create real worksheet/range rules and set permission points.',
      '创建真实工作表/区域规则并设置权限点。',
    ],
    [
      'shadow',
      'Apply shadow strategy',
      '应用阴影策略',
      'Change rendering through the global public Facade setter.',
      '通过公开全局 Facade setter 修改绘制策略。',
    ],
    [
      'select',
      'Select / switch worksheet',
      '选区 / 切换工作表',
      'Use native selection and worksheet APIs.',
      '调用原生选择和工作表 API。',
    ],
    [
      'write',
      'Permission-aware write / clear',
      '检查权限后写入 / 清空',
      'Check canEditCell, then setValue or clearContent.',
      '检查 canEditCell 后调用 setValue 或 clearContent。',
    ],
    [
      'inspect',
      'Inspect / download',
      '检查 / 下载',
      'Read current Facade state or save local JSON.',
      '读取当前 Facade 状态或保存本地 JSON。',
    ],
    [
      'reset',
      'Empty / Reset',
      '清空 / 重置',
      'Rebuild the owner and reapply the default protection.',
      '重建实例并重新应用默认保护。',
    ],
  ].map(([id, en, zh, de, dz]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': de, 'zh-CN': dz },
  })),
  states: [
    ['pending', 'Applying local permissions', '正在应用本地权限'],
    ['locked', 'Editing denied', '编辑被拒绝'],
    ['hidden', 'View denied (local data remains)', '查看被拒绝（本地数据仍存在）'],
    ['editable', 'Editing allowed', '允许编辑'],
    ['empty', 'Empty hours, formula retained', '空工时且保留公式'],
    ['error', 'Action failed or invalid input', '操作失败或无效输入'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  title: {
    'en-US': 'Hide Permission Background Shadow',
    'zh-CN': '隐藏权限背景阴影',
    'zh-TW': '隱藏權限背景陰影',
    'ja-JP': '権限の背景影を非表示にする',
  },
  description: {
    'en-US': 'This example demonstrates how to hide the permission background shadow in Univer Sheets.',
    'zh-CN': '这个示例展示了如何在 Univer Sheets 中隐藏权限背景阴影。',
    'zh-TW': '這個範例展示了如何在 Univer Sheets 中隱藏權限背景陰影。',
    'ja-JP': 'この例では、Univer Sheets で権限の背景影を非表示にする方法を示します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Preset Mode'],
    'zh-CN': ['Univer Sheets', '预设模式'],
    'zh-TW': ['Univer Sheets', '預設模式'],
    'ja-JP': ['Univer Sheets', 'プリセットモード'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})

export default {
  metadata,
  files,
  Preview,
}
