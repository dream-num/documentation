import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Sheets host / Tab', 'zh-CN': 'Sheets 宿主 / 标签嵌入' },
  title: { 'en-US': 'Docs in Sheets / Capacity Assumptions Tab', 'zh-CN': 'Docs 嵌入 Sheets / 容量假设标签' },
  description: {
    'en-US':
      'A repair-weekend capacity workbook carries a native modern-document tab explaining skill limits, available hours and unresolved readiness checks.',
    'zh-CN': '维修周末容量工作簿内置原生现代文档标签，解释技能限制、有效工时和未完成的准备事项。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Modern Docs', 'Tab'], 'zh-CN': ['嵌入', '表格', '现代文档', '标签'] },
  packages: [
    '@univerjs/core',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createWorkbook()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getDocument()',
    'FDocument.getParagraphs()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Juniper has 89 assessment slots for 77 bookings, yet Electronics is short by two. The native Assumptions tab explains the skill-specific capacity model; Readiness tracks outstanding checks. This is an editable Docs child occupying a real workbook tab, not an external note or Float mode toggle.',
      'zh-CN':
        'Juniper 有 89 个评估名额、77 个预约，但电子维修仍缺 2 个名额。原生 Assumptions 标签说明按技能划分的容量模型，Readiness 工作表记录未完成事项。这是占据真实工作簿标签的可编辑 Docs 子单元，不是外部便签或 Float 模式开关。',
    },
    tryIt: {
      'en-US': [
        'Compare available slots by workshop, not just the total.',
        'Open the native Assumptions tab, edit a paragraph, then visit Readiness and return.',
        'Return to Weekly capacity and increase Electronics volunteers in B6 from 4 to 5. Capacity rises to 92 and that queue gains one available slot.',
        'Check that editing the host does not rewrite the independent document. Formula-linked prose is a separate case.',
      ],
      'zh-CN': [
        '逐工种比较剩余名额，而不只看合计。',
        '打开原生 Assumptions 标签，编辑段落，再访问 Readiness 并返回。',
        '返回 Weekly capacity，将 B6 的电子维修志愿者从 4 改为 5。总容量增至 92，该工种剩余 1 个名额。',
        '确认宿主修改没有重写独立文档；公式关联文本另有案例。',
      ],
    },
    expected: {
      'en-US':
        'Tab switching preserves child content and host formulas remain independently editable. Reload recreates the original plan. This case is under verification: history, lifecycle, export, narrow layouts and accessibility are not fully accepted. Exchange and Print are not registered. The data is fictional, not a live booking system.',
      'zh-CN':
        '标签切换保留子文档内容，宿主公式独立可编辑。刷新重建原始计划。本例仍在验证，撤销归属、生命周期、导出、窄屏和可访问性尚未完整验收；未注册 Exchange 或 Print。数据为虚构内容，不是实时预约系统。',
    },
  },
  variants: [
    {
      id: 'capacity',
      label: { 'en-US': 'Skill-specific capacity / Lilac and coral', 'zh-CN': '分技能容量 / 丁香紫与珊瑚色' },
    },
    {
      id: 'assumptions',
      label: { 'en-US': 'Editable assumptions / Modern document', 'zh-CN': '可编辑假设 / 现代文档' },
    },
    { id: 'readiness', label: { 'en-US': 'Readiness and exclusions / Worksheet', 'zh-CN': '准备事项与边界 / 工作表' } },
  ],
  actions: [
    { id: 'tabs', label: { 'en-US': 'Switch native workbook tabs', 'zh-CN': '切换原生工作簿标签' } },
    { id: 'memo', label: { 'en-US': 'Edit the document independently', 'zh-CN': '独立编辑文档' } },
    { id: 'staffing', label: { 'en-US': 'Recalculate staffing capacity', 'zh-CN': '重算人员容量' } },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Capacity worksheet', 'zh-CN': '容量工作表' } },
    { id: 'child', label: { 'en-US': 'Native Docs tab', 'zh-CN': '原生 Docs 标签' } },
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
