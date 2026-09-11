import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  image: '/assets/showcase/embed-boards-in-sheets-float.png',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Float', 'zh-CN': 'Sheets 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Board in Sheets / Dock Handoff', 'zh-CN': 'Board 嵌入 Sheets / 码头交接' },
  description: {
    'en-US':
      'An editable dock-handoff diagram floats beside a shift-cost workbook. Bound connectors show the matched and exception paths; estimates do not authorize handoffs.',
    'zh-CN': '可编辑的码头交接流程图浮动在班次成本表旁。绑定连线展示核对一致与差异处理路径；估算不代表交接放行。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Boards', 'Float'], 'zh-CN': ['嵌入', '表格', '画板', '浮动'] },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets-ui',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getBoard()',
    'FBoard.getShape()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Tidal pairs eight original shift-cost lines with a native floating Board. Six process nodes and six bound connectors describe manifest review, count matching, a hold bay, label rechecks and handoff closure. Expected 42 versus counted 41 leaves an explicit unresolved exception. Blue, apricot, coral, lavender and mint distinguish roles without reskinning the editor.',
      'zh-CN':
        'Tidal 将八项原创班次成本与原生浮动 Board 组合。六个流程节点、六条绑定连线说明清单检查、数量核对、暂存、标签复核与交接记录。应到 42 件、实点 41 件，明确保留未解决的差异。青蓝、杏黄、珊瑚、浅紫和薄荷色区分角色，不覆盖编辑器官方样式。',
    },
    tryIt: {
      'en-US': [
        'Compare the eight estimated costs and the 10% planning allowance.',
        'Double-click the floating Board to activate native editing, then inspect the matched and difference branches.',
        'Edit the Hold bay shape text or move a process node using native Board controls.',
        'Change B5 dock crew hours from 18 to 20. D18 increases from 2305.60 to 2376.00; the Board remains independent.',
      ],
      'zh-CN': [
        '比较八项估算成本与 10% 计划预留。',
        '双击浮动 Board 激活原生编辑，查看核对一致与差异路径。',
        '使用 Board 原生操作编辑 Hold bay 文本或移动流程节点。',
        '将 B5 码头人员工时从 18 改为 20，D18 从 2305.60 增至 2376.00；Board 保持独立。',
      ],
    },
    expected: {
      'en-US':
        'This is a real native Board, not an iframe or static screenshot. Host formulas and Board decisions have separate state; names are authored local text. Training data is not a live dispatch, approval or port-safety system. Reload loses edits. Native keyboard/history, lifecycle, export integration, accessibility and performance remain under verification. No Exchange/Print conversion is claimed.',
      'zh-CN':
        '这是原生 Board，不是 iframe 或静态截图。宿主公式与 Board 决策状态独立；姓名为预设本地文本。培训数据不属于实时调度、审批或港口安全系统。刷新会丢失修改。原生键盘与撤销归属、生命周期、导出集成、可访问性和性能仍待验证。不声称已支持 Exchange/Print 转换。',
    },
  },
  variants: [
    { id: 'matched', label: { 'en-US': 'Matched count / Handoff path', 'zh-CN': '数量一致 / 交接路径' } },
    {
      id: 'exception',
      label: { 'en-US': 'Count difference / Hold and recheck loop', 'zh-CN': '数量差异 / 暂存与复核闭环' },
    },
  ],
  actions: [
    { id: 'activate', label: { 'en-US': 'Activate the native floating Board', 'zh-CN': '激活原生浮动 Board' } },
    { id: 'edit', label: { 'en-US': 'Edit process nodes with native tools', 'zh-CN': '使用原生工具编辑流程节点' } },
    { id: 'cost', label: { 'en-US': 'Recalculate independent staffing costs', 'zh-CN': '重算独立人员成本' } },
  ],
  states: [
    { id: 'overview', label: { 'en-US': 'Cost and process overview', 'zh-CN': '成本与流程概览' } },
    { id: 'active', label: { 'en-US': 'Native Board editing', 'zh-CN': '原生 Board 编辑' } },
    { id: 'error', label: { 'en-US': 'Source failure / reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
  ],
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
