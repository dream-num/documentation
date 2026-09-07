import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1000,
  group: { 'en-US': 'Slides host / Tab', 'zh-CN': 'Slides 宿主 / 页面嵌入' },
  title: { 'en-US': 'Sheets in Slides / Pilot Appendix', 'zh-CN': 'Sheets 嵌入 Slides / 试播附录' },
  description: {
    'en-US':
      'A radio-season deck opens an eight-week production workbook as its own native page. Test hours, shared rates and the pilot budget.',
    'zh-CN': '电台试播季演示文稿以独立原生页面打开八周制作工作簿，调整工时、共享费率与试播预算。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Sheets', 'Tab', 'Planning'],
    'zh-CN': ['嵌入', '幻灯片', '表格', '页面', '计划'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FRange.setValue()',
    'FRange.getRawValue()',
    'FPresentation.getActiveSlide()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Aster separates the editorial story from the working production model. The native page list places a Sheets appendix between the opening slide and the editorial mix. Deep teal, sand and sage create distinct narrative roles while official SDK chrome stays intact.',
      'zh-CN':
        'Aster 将编辑叙事与制作模型分开。原生页面列表把 Sheets 附录放在开场页和内容组合页之间，深青、暖沙、浅绿区分内容角色，保留官方 SDK 界面。',
    },
    tryIt: {
      'en-US': [
        'Open Pilot schedule in the native Slides page list. Inspect the eight different episodes in Schedule.',
        'Change Schedule!D5 from 2 to 3 studio hours. Total cost should move from 2,040 to 2,085.',
        'Open Resources: one studio hour and 915 budget dollars remain. Try native Undo/Redo, then return to the editorial slides.',
        'Reopen Pilot schedule to check the edited workbook. Changing the model does not approve or broadcast the programme.',
        'On Resources, use the native Print menu. Fit to width renders one preview page; Cancel returns to the workbook without sending a backend request.',
      ],
      'zh-CN': [
        '在 Slides 原生页面列表打开 Pilot schedule，查看 Schedule 中八期不同节目。',
        '将 Schedule!D5 的录音室工时从 2 改为 3，总成本应从 2,040 变为 2,085。',
        '打开 Resources：录音室余量为 1 小时、预算余量为 915 美元。使用原生 Undo/Redo，再返回编辑叙事页。',
        '重新打开 Pilot schedule 检查修改后的工作簿；调整模型不会批准或播出节目。',
        '在 Resources 使用原生 Print 菜单，适应页宽后生成一页预览；Cancel 返回工作簿，不发送后端请求。',
      ],
    },
    expected: {
      'en-US':
        'A dedicated native page exposes the child workbook and its own worksheet tabs. This differs from an inline float. Selected navigation, recalculation, Undo/Redo, one-page print preview and disposal checks pass; broader editing, lifecycle and performance acceptance remain open. All content is fictional and reload loses edits.',
      'zh-CN':
        '独立原生页面展示子工作簿及其工作表标签，与行内浮动对象不同。选定的导航、重算、撤销重做、一页打印预览和销毁检查已通过；完整编辑、生命周期和性能仍待验收。内容均为虚构，刷新丢失修改。',
    },
  },
  variants: [
    { id: 'season', label: { 'en-US': 'Season / Editorial context', 'zh-CN': '试播季 / 编辑背景' } },
    { id: 'schedule', label: { 'en-US': 'Schedule / Eight different episodes', 'zh-CN': '排期 / 八期不同节目' } },
    { id: 'resources', label: { 'en-US': 'Resources / Shared rates and limits', 'zh-CN': '资源 / 共享费率与上限' } },
  ],
  actions: [
    { id: 'open', label: { 'en-US': 'Open the native appendix page', 'zh-CN': '打开原生附录页' } },
    { id: 'edit', label: { 'en-US': 'Change hours and recalculate', 'zh-CN': '调整工时并重算' } },
    { id: 'history', label: { 'en-US': 'Use native child Undo/Redo', 'zh-CN': '使用子工作簿原生撤销重做' } },
  ],
  states: [
    { id: 'host', label: { 'en-US': 'Read the season narrative', 'zh-CN': '阅读试播季叙事' } },
    { id: 'child', label: { 'en-US': 'Edit the production model', 'zh-CN': '编辑制作模型' } },
    { id: 'error', label: { 'en-US': 'Source failure / Reload to retry', 'zh-CN': '资源失败 / 刷新重试' } },
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
