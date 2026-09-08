import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Slides host / Float', 'zh-CN': 'Slides 宿主 / 浮动' },
  title: { 'en-US': 'Canvases in Slides / Architecture Float', 'zh-CN': 'Canvases 嵌入 Slides / 架构浮动图' },
  description: {
    'en-US':
      'Review an editable observatory ingestion diagram inside a narrative slide, with distinct field, ingestion and exception boundaries.',
    'zh-CN': '在叙事幻灯片内评审可编辑的观测站数据回传图，分开说明现场、接入与异常处理边界。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Canvases', 'Float', 'Architecture'],
    'zh-CN': ['嵌入', '幻灯片', 'Canvases', '浮动', '架构'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/boards',
    '@univerjs-pro/boards-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FUniver.getBoard()',
    'FBoard.getShape()',
    'FShapeText.setText()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Beacon proposes offline ingestion for twelve fictional observation stations. Three native slides explain a 24-hour buffer target, duplicate detection and review checks. The floating native Canvas contains six editable nodes, six bound connectors and four annotations. No fixture panel or substitute image is used.',
      'zh-CN':
        'Beacon 为十二个虚构观测站设计离线回传。三页原生幻灯片说明 24 小时缓存目标、去重与评审检查；浮动原生 Canvases 包含六个可编辑节点、六条绑定连接线和四个注释，不使用通用测试面板或图片替代。',
    },
    tryIt: {
      'en-US': [
        'Double-click the diagram to activate the native Canvas. Select a node and use its native editing tools.',
        'Run the first README example to change the quarantine decision. Use native Undo/Redo and check that the slide narrative stays unchanged.',
        'Open the other slide thumbnails to compare responsibilities and failure checks, then return to the edited diagram.',
        'Run the second README example to change the host headline. Switch theme and verify that the Canvas and slide edits remain independent.',
      ],
      'zh-CN': [
        '双击架构图激活原生 Canvases，选择节点并使用原生编辑工具。',
        '运行 README 第一段示例修改隔离队列决策，使用原生撤销重做并确认幻灯片叙事不变。',
        '切换其他幻灯片比较责任分工与失败检查，再返回已编辑 Canvases。',
        '运行 README 第二段示例修改宿主标题，切换主题并确认 Canvases 与幻灯片编辑独立保留。',
      ],
    },
    expected: {
      'en-US':
        'A real SlideFloating Canvas, not a tab, iframe or screenshot. Native Grid host menus and official Canvases tools share the page. Targets are fictional; slide copy is not formula-linked. Native editing, movement and keyboard history have selected checks. Known failure: Enter fullscreen opens no shell, so the overall native runtime gate fails. Theme changes regenerate the native Canvas palette while preserving authored content. No sensors, messages, deployments, approvals or backend. Reload restores initial data; see README for remaining acceptance.',
      'zh-CN':
        '真正的 SlideFloating Canvases，不是标签页、iframe 或截图。原生 Grid 宿主菜单与官方 Canvases 工具共同工作。目标值均为虚构设计输入；幻灯片文案不使用公式关联。编辑、移动与键盘历史已完成选定检查。已知失败：Enter fullscreen 无法打开全屏视图，因此整体运行检查仍失败。主题切换会重新生成 Canvases 原生色表，但保留编写内容。不连接传感器、不发消息、不部署、不审批、不使用后端。刷新恢复初始数据；其余验收项见 README。',
    },
  },
  variants: [
    ['architecture', 'Ingestion diagram / Six service nodes', '回传架构图 / 六个节点'],
    ['tradeoffs', 'Buffer, validate, preserve / Three owners', '缓存、校验、保留 / 三方责任'],
    ['checks', 'Disconnect, replay, quarantine / Review gates', '断网、重放、隔离 / 评审检查'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['activate', 'Activate and edit the native Canvas', '激活并编辑原生 Canvases'],
    ['history', 'Use native history on the diagram', '在架构图使用原生历史'],
    ['navigate', 'Navigate the host without replacing the child', '切换宿主而不替换子 Canvases'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Architecture review slide', '架构评审幻灯片'],
    ['child', 'Interactive boundary diagram', '交互边界图'],
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
