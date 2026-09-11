import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1120,
  group: { 'en-US': 'Boards host / Float', 'zh-CN': 'Boards 宿主 / 浮动' },
  title: {
    'en-US': 'Bases in Boards / Research Backlog',
    'zh-CN': 'Bases 嵌入 Boards / 研究任务',
  },
  description: {
    'en-US':
      'Pair park-route observations with nine research questions and four linked themes, using native Base records beside independent Board notes.',
    'zh-CN': '将公园路线观察与九条研究任务、四个关联主题并列展示，原生 Base 记录与 Boards 笔记相互独立。',
  },
  tags: {
    'en-US': ['Embed', 'Boards', 'Bases', 'Float', 'Research'],
    'zh-CN': ['嵌入', '画板', '多维表格', '浮动', '研究'],
  },
  packages: [
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBoard()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FBase.getTableById()',
    'FRecord.setValue()',
    'FShapeText.setText()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Grove studies how visitors choose a park route. Four colored Board notes frame wayfinding, comfort, access and trust. The floating Base contains nine distinct research tasks and four linked themes, with owners, dates, confidence and synthetic evidence. No observations were collected from real visitors.',
      'zh-CN':
        'Grove 研究访客如何选择公园路线。四张彩色 Boards 卡片概括导向、舒适、无障碍和信息可信度；浮动 Base 包含九条不同研究任务及四个关联主题，具有负责人、日期、信心程度和虚构证据。未采集真实访客数据。',
    },
    tryIt: {
      'en-US': [
        'Double-click the Base to activate native editing.',
        'Run the README record example and try native Undo/Redo.',
        'Enter fullscreen, open Themes and rename a theme; inspect its linked labels in Questions.',
        'Return to the Board and refine its next step independently.',
      ],
      'zh-CN': [
        '双击 Base 激活原生编辑。',
        '运行 README 记录示例并尝试原生撤销重做。',
        '进入全屏，打开 Themes 重命名主题，再查看 Questions 中的关联标签。',
        '返回 Boards，独立完善下一步。',
      ],
    },
    expected: {
      'en-US':
        'Native BoardFloating, real linked records and official white SDK surfaces, with forest, blue, sand, lavender and rose content accents. Selected native editing/history, fullscreen and linked labels pass. No fixture panel, duplicate toolbar, iframe or automatic Board synchronization; see README for remaining acceptance.',
      'zh-CN':
        '原生 BoardFloating、真实关联记录和官方白色 SDK 界面，内容使用森林绿、蓝、沙色、淡紫和玫瑰色。选定的原生编辑与撤销重做、全屏和关联标签通过验证。无 fixture 面板、重复工具栏、iframe 或 Boards 自动同步；待验收项详见 README。',
    },
  },
  variants: [
    ['questions', 'Nine distinct research questions', '九条不同研究任务'],
    ['themes', 'Four linked research themes', '四个关联研究主题'],
    ['evidence', 'Evidence, assumptions and pending tests', '证据、假设和待执行测试'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['edit', 'Refine a research record', '完善研究记录'],
    ['link', 'Rename a linked theme', '重命名关联主题'],
    ['board', 'Update the Board independently', '独立更新 Boards'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['passive', 'Research queue beside observations', '观察旁的研究队列'],
    ['active', 'Native record and theme editing', '原生记录与主题编辑'],
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
