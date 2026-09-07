import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Float', 'zh-CN': 'Sheets 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Base in Sheets / Campaign Owners', 'zh-CN': 'Base 嵌入 Sheets / 营销执行负责人' },
  description: {
    'en-US':
      'A campaign budget keeps its editable delivery Base beside the spend: different channels, owners, deadlines and evidence make readiness distinct from money committed.',
    'zh-CN': '营销预算旁嵌入可编辑的执行 Base，通过不同渠道、负责人、期限和证据，说明执行准备与预算占用并不相同。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Bases', 'Float'], 'zh-CN': ['嵌入', '表格', '多维表格', '浮动'] },
  packages: [
    '@univerjs/core',
    '@univerjs/sheets-ui',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getBase()',
    'FBaseTableRecord.setValue()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Atlas has a $15,000 community-launch plan and $12,170 committed, yet its workshop venue remains blocked. A real floating Base holds eight different deliverables, local text owners, due dates and next evidence. Budget and operational records are independent units, not a simulated host table.',
      'zh-CN':
        'Atlas 社区推广计划预算为 15,000 美元，已承诺支出 12,170 美元，但工作坊场地仍有阻塞。真实浮动 Base 包含八项不同任务、本地文本负责人、期限和下一步证据。预算与执行记录是独立单元，不是宿主模拟表格。',
    },
    tryIt: {
      'en-US': [
        'Compare channel commitments with the budget, including the $250 workshop overrun.',
        'Double-click the floating Base to edit a deliverable or its owner with native controls.',
        'Scroll the Base horizontally to inspect Channel and Next evidence.',
        'Return to the sheet and change Workshop committed C7 from 3750 to 4000. Available budget becomes 2580; Base task text should remain unchanged.',
      ],
      'zh-CN': [
        '比较渠道预算与支出，注意工作坊超支 250 美元。',
        '双击浮动 Base，使用原生操作编辑任务或负责人。',
        '在 Base 内水平滚动查看渠道和下一步证据。',
        '返回表格，将 C7 的工作坊支出从 3750 改为 4000。可用预算变为 2580；Base 任务内容应保持不变。',
      ],
    },
    expected: {
      'en-US':
        'A native SheetFloating anchor resolves an editable Base. Owner names are local text, not directory identities. Reload loses edits. This case is under verification; history, lifecycle, narrow layouts and accessibility are not fully accepted. No backend, Exchange or Print workflow is provided here.',
      'zh-CN':
        '原生 SheetFloating 锚点加载可编辑 Base。负责人是本地文本，不是通讯录身份；刷新丢失修改。本例仍在验证，撤销归属、生命周期、窄屏和可访问性尚未完整验收；不提供后端、Exchange 或 Print 流程。',
    },
  },
  variants: [
    { id: 'spend', label: { 'en-US': 'Budget commitments / Teal and warm ochre', 'zh-CN': '预算占用 / 青绿与暖赭色' } },
    {
      id: 'delivery',
      label: { 'en-US': 'Delivery readiness / Native Base grid', 'zh-CN': '执行准备 / 原生 Base 网格' },
    },
  ],
  actions: [
    { id: 'activate', label: { 'en-US': 'Activate the native floating Base', 'zh-CN': '激活原生浮动 Base' } },
    { id: 'edit', label: { 'en-US': 'Edit task ownership independently', 'zh-CN': '独立编辑任务负责人' } },
    { id: 'recalculate', label: { 'en-US': 'Recalculate committed spend', 'zh-CN': '重算已承诺支出' } },
  ],
  states: [
    { id: 'passive', label: { 'en-US': 'Budget with passive Base preview', 'zh-CN': '预算与非激活 Base 预览' } },
    { id: 'active', label: { 'en-US': 'Active native Base editing', 'zh-CN': '激活的原生 Base 编辑' } },
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
