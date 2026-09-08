import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  image: '/assets/showcase/sheets-permission.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Protection', 'zh-CN': '保护' },
  title: { 'en-US': 'Protection and native shadows', 'zh-CN': '保护与原生阴影' },
  description: {
    'en-US': 'Compare six local worksheet permission states and native protection shadows.',
    'zh-CN': '对照六种本地工作表权限状态与原生保护阴影。',
  },
  tags: { 'en-US': ['Univer Sheets', 'Preset Mode'], 'zh-CN': ['Univer Sheets', '预设模式'] },
  packages: ['@univerjs/presets', '@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FWorksheetPermission.protect() / setPoint() / canEditCell() / canViewCell()' },
    { name: 'FRangePermission.protect() / FRangeProtectionRule.setPoint()' },
    { name: 'FUniver.setProtectedRangeShadowStrategy() / getProtectedRangeShadowStrategy() / toggleDarkMode()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Six independent native worksheets compare whole-sheet, range, view, editable-rule, mixed and unprotected states. The only host control changes the global SDK shadow strategy.',
      'zh-CN':
        '六张独立原生工作表对照整表、区域、查看、可编辑规则、混合及无保护状态。唯一宿主控件修改全局 SDK 阴影策略。',
    },
    tryIt: {
      'en-US': [
        'Switch native worksheet tabs and type into C4, C8 and outside-range B4 to compare allowed and denied edits.',
        'Mixed ranges permit C4:C6 but block C7:C9; other worksheets retain their own values.',
        'Compare the four shadow strategies. None removes shadows, not permissions. Theme changes preserve the owner and edits.',
      ],
      'zh-CN': [
        '使用原生工作表标签切换，在 C4、C8 和区域外 B4 输入，对比允许与禁止编辑的效果。',
        '混合区域允许 C4:C6 编辑但禁止 C7:C9，其他工作表保留独立数值。',
        '对照四种阴影策略。无阴影不代表无权限；主题切换保留实例与编辑。',
      ],
    },
    expected: {
      'en-US':
        'Frontend-only permissions are not server authorization or encryption. Locally loaded data remains accessible to SDK readback even when View is false. Never distribute confidential data this way. Async initialization failures remain visible and editing stays disabled. Preview and export share the factory, full English Core locales and official CSS.',
      'zh-CN':
        '纯前端权限不是服务端鉴权或加密。View=false 时 SDK 仍可读取本地加载的数据，不应用此方式分发保密数据。异步初始化失败时显示错误并保持禁止编辑。预览与导出共享工厂、完整英文 Core 语言包及官方样式。',
    },
  },
  variants: [
    ['worksheet', 'Whole sheet locked', '整表只读'],
    ['locked', 'Range locked', '区域只读'],
    ['hidden', 'Not viewable', '不可查看'],
    ['editable', 'Editable rule', '可编辑规则'],
    ['mixed', 'Mixed ranges', '混合区域'],
    ['none', 'Unprotected', '无保护'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native-edit', 'Native cell editing', '原生单元格编辑'],
    ['native-sheet', 'Native worksheet tabs', '原生工作表标签'],
    ['shadow', 'Global shadow strategy', '全局阴影策略'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['pending', 'Applying local permissions', '正在应用本地权限'],
    ['ready', 'Permissions ready', '权限已就绪'],
    ['error', 'Initialization failed; editing disabled', '初始化失败，禁止编辑'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
