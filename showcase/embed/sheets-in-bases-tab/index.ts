import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Relational Tables host / Tab', 'zh-CN': 'Relational Tables 宿主 / 标签' },
  title: {
    'en-US': 'Sheets in Relational Tables / Pipeline Forecast',
    'zh-CN': 'Sheets 嵌入 Relational Tables / 商机预测',
  },
  description: {
    'en-US':
      'Open a native workbook tab beside ten opportunities and four linked customer groups; explore real stage-weighted what-if formulas.',
    'zh-CN': '在十条商机、四个关联客户分组旁打开原生工作簿标签，通过真实公式探索阶段加权预测。',
  },
  tags: {
    'en-US': ['Embed', 'Relational Tables', 'Sheets', 'Tab', 'Forecast'],
    'zh-CN': ['嵌入', 'Relational Tables', '电子表格', '标签', '预测'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBase()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FRange.setValue()',
    'FBaseRecord.setValue()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Acorn reviews ten fictional installation opportunities across four customer groups. The Relational Table tracks stages, owners and next conversations. A native table-list tab opens a separate two-sheet forecast with editable stage weights and genuine formulas; no fixture panel or duplicate toolbar.',
      'zh-CN':
        'Acorn 评估四个客户分组的十条虚构安装商机。Relational Table 跟踪阶段、负责人和下一次沟通；原生表列表标签打开独立的双工作表预测，提供可编辑阶段权重与真实公式，不添加通用测试面板或重复工具栏。',
    },
    tryIt: {
      'en-US': [
        'Open Weighted forecast from the native Relational Table sidebar, then visit Forecast and Assumptions.',
        'Change Qualified from 40% to 50%, then 0%, or run the first README example. Check three weighted values and native Undo/Redo.',
        'Return to Opportunities and run the Relational Table README example. The workbook must remain unchanged.',
        'Rename a customer group in Accounts, inspect linked labels, then revisit the forecast and switch theme.',
      ],
      'zh-CN': [
        '从 Relational Table 原生侧栏打开 Weighted forecast，切换 Forecast 和 Assumptions。',
        '将 Qualified 从 40% 改为 50%，再改为 0%，或运行 README 第一段示例；检查三项加权值及原生撤销重做。',
        '返回 Opportunities 并运行 Relational Table README 示例；工作簿内容应保持不变。',
        '在 Accounts 重命名客户分组，检查关联标签，再返回预测并切换主题。',
      ],
    },
    expected: {
      'en-US':
        'A native Sheets tab inside Relational Table, with Grid ribbon and official white UI. Qualified weights 40%, 50%, 0% produce 215,125 / 222,725 / 184,725. Relational Table and workbook remain independent, not live CRM synchronization. Native print preview is verified, not physical output. No backend, messages, invoices or approvals. Reload loses edits. Selected checks pass; full acceptance remains partial. See README.',
      'zh-CN':
        'Relational Table 内真正的 Sheets 标签，使用 Grid 菜单和官方白色界面。Qualified 权重 40%、50%、0% 分别得到 215,125 / 222,725 / 184,725。Relational Table 与工作簿保持独立，不是实时 CRM 同步。已验证原生打印预览，不代表实际打印输出。没有后端、消息、发票或审批；刷新丢失修改。选定检查通过，完整验收仍为部分覆盖，详见 README。',
    },
  },
  variants: [
    ['pipeline', 'Ten opportunities / Four customer groups', '十条商机 / 四个客户分组'],
    ['weights', 'Qualified weight / 40%, 50%, 0%', 'Qualified 权重 / 40%、50%、0%'],
    ['target', 'Forecast and editable target gap', '预测与可编辑目标差额'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Open the native workbook tab', '打开原生工作簿标签'],
    ['calculate', 'Edit weights and undo recalculation', '编辑权重并撤销重算'],
    ['return', 'Edit Relational Table follow-ups independently', '独立编辑 Relational Table 跟进记录'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Opportunity and account tables', '商机与客户分组表'],
    ['child', 'Active forecast workbook', '激活的预测工作簿'],
    ['error', 'Source failure / Reload to retry', '资源失败 / 刷新重试'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
