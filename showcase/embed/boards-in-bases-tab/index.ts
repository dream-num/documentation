import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Bases host / Tab', 'zh-CN': 'Bases 宿主 / 标签' },
  title: { 'en-US': 'Boards in Bases / Service Blueprint', 'zh-CN': 'Boards 嵌入 Bases / 服务蓝图' },
  description: {
    'en-US':
      'Trace four lending touchpoints across borrower, front-desk and backstage lanes beside eight linked Base requests.',
    'zh-CN': '在八条关联借用请求旁，通过借用人、前台与后台三条泳道说明四个服务阶段。',
  },
  tags: {
    'en-US': ['Embed', 'Bases', 'Boards', 'Tab', 'Service design'],
    'zh-CN': ['嵌入', '多维表格', '白板', '标签', '服务设计'],
  },
  packages: [
    '@univerjs-pro/bases',
    '@univerjs-pro/bases-ui',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createBase()',
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FShapeText.setText()',
    'FBaseRecord.setValue()',
    'FBoard.describeElements()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Cove is a fictional equipment lending desk. Eight requests span four touchpoints. A native Board tab shows twelve responsibility cards and seventeen bound connectors across borrower, front-desk and backstage lanes. The design explains intended handoffs, not automated reservations.',
      'zh-CN':
        'Cove 是虚构设备借用服务台，八条请求分布在四个阶段。原生白板标签用十二张职责卡片和十七条绑定连接线，展示借用人、前台、后台三条泳道。蓝图说明预期交接，不是自动预约系统。',
    },
    tryIt: {
      'en-US': [
        'Open Service blueprint from the Base sidebar and trace the four stages.',
        'Run the Board README example; try native Undo/Redo, direct text editing and arrow-key movement.',
        'Return to Requests and run the Base example; the Board must remain unchanged.',
        'Rename Reserve in Touchpoints, inspect three linked labels, then return to the Board and change theme.',
      ],
      'zh-CN': [
        '从 Base 侧栏打开 Service blueprint，沿四个阶段查看流程。',
        '运行 README 白板示例，尝试原生撤销重做、直接输入和方向键移动。',
        '返回 Requests 运行 Base 示例；白板应保持不变。',
        '在 Touchpoints 重命名 Reserve，检查三个关联标签，再返回白板并切换主题。',
      ],
    },
    expected: {
      'en-US':
        'Native Board tools and real shape-bound connectors inside a Base tab, with nine official stylesheets and no fixture panel. Selected production checks pass native editing/history, rendered connector endpoints, linked labels and model ownership. Full acceptance remains partial. No backend, booking or automatic field updates; reload loses edits. See README.',
      'zh-CN':
        'Base 标签内原生白板工具与真实形状绑定连接线，包含九份官方样式，无 fixture 面板。所选生产验证通过原生编辑及撤销重做、连接线渲染端点、关联标签与模型隔离；完整验收仍为部分覆盖。没有后端、预约或字段自动更新；刷新丢失修改，详见 README。',
    },
  },
  variants: [
    ['queue', 'Eight requests / Four linked touchpoints', '八条请求 / 四个关联阶段'],
    ['lanes', 'Borrower, front desk and backstage', '借用人、前台与后台'],
    ['handoffs', 'Twelve cards / Seventeen bound connectors', '十二张卡片 / 十七条绑定连接线'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Open the native service blueprint', '打开原生服务蓝图'],
    ['edit', 'Edit and move cards with native history', '编辑与移动卡片并使用原生历史'],
    ['return', 'Update linked Base records independently', '独立更新关联 Base 记录'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Requests and touchpoints', '请求与服务阶段'],
    ['child', 'Active service blueprint', '激活的服务蓝图'],
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
