import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/boards-incident-response.png',
  product: 'boards' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Operations and diagrams', 'zh-CN': '运营与图示' },
  title: { 'en-US': 'Incident Response Board', 'zh-CN': '事故响应 Boards' },
  description: {
    'en-US':
      'Coordinate a SEV-1 payment response with native cards, a frame, free-endpoint connectors and a reconciliation deadline.',
    'zh-CN': '使用原生卡片、容器框、自由端点连接线和对账截止时间协调 SEV-1 支付事故。',
  },
  tags: { 'en-US': ['Boards', 'Diagram', 'Operations'], 'zh-CN': ['白板', '图示', '运营'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/engine-shape'],
  apis: [
    { name: 'FUniver.createBoard()' },
    { name: 'FBoard.addElements()' },
    { name: 'createBoardConnectorElement()' },
    { name: 'createBoardTextBoxShapeElement()' },
    { name: 'FBoard.getShape().getText().setText()' },
    { name: 'FBoard.setElementTransform() / setConnectorStyle()' },
    { name: 'FBoard.save() / undo() / redo()' },
  ],
  guide: {
    overview: {
      'en-US': 'A deterministic incident workflow rendered as real Board elements.',
      'zh-CN': '以真实 Boards 元素渲染的确定性事故工作流。',
    },
    tryIt: {
      'en-US': [
        'Move and resize response cards.',
        'Inspect the existing follow-up risk and its deadline.',
        'Edit the native cards; theme changes retain your edits.',
      ],
      'zh-CN': ['移动并调整响应卡片。', '查看已有后续风险及其截止时间。', '直接编辑原生卡片；主题切换保留编辑。'],
    },
    expected: {
      'en-US':
        'Three response stages and the original follow-up risk are present from startup. The two connectors have free endpoints; moving cards is not claimed to update their endpoints.',
      'zh-CN': '启动即展示三个响应阶段与原始后续风险。两条连接线使用自由端点，不承诺移动卡片后端点自动跟随。',
    },
  },
  variants: [
    { id: 'response-path', label: { 'en-US': 'Three-stage response', 'zh-CN': '三阶段响应' } },
    { id: 'with-risk', label: { 'en-US': 'Response with follow-up risk', 'zh-CN': '包含后续风险' } },
  ],
  actions: [{ id: 'edit-risk', label: { 'en-US': 'Edit the native risk card', 'zh-CN': '编辑原生风险卡' } }],
  states: [
    { id: 'normal', label: { 'en-US': 'Active incident', 'zh-CN': '活动事故' } },
    { id: 'follow-up', label: { 'en-US': 'Follow-up identified', 'zh-CN': '已识别后续事项' } },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})

export default { metadata, files, Preview }
