import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Slides host / Float', 'zh-CN': 'Slides 宿主 / 浮动嵌入' },
  title: { 'en-US': 'Docs in Slides / Decision Memo', 'zh-CN': 'Docs 嵌入 Slides / 决策备忘录' },
  description: {
    'en-US':
      'Edit a modern decision memo beside a three-slide neighbourhood walking proposal, inside a native document float.',
    'zh-CN': '在三页社区步行提案旁，通过原生浮动现代文档编辑决策理由。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Docs', 'Float', 'Decision'],
    'zh-CN': ['嵌入', '幻灯片', '文档', '浮动', '决策'],
  },
  packages: [
    '@univerjs/core',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/embed',
    '@univerjs-pro/embed-ui',
  ],
  apis: [
    'FUniver.createPresentation()',
    'FUniver.createEmbed()',
    'FEmbed.loadAsync()',
    'FDocument.getParagraphs()',
    'FDocumentParagraph.setText()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Vale weighs a six-week, two-route walking pilot against research-only and full-scale options. Three native slides keep the decision visible; a modern Docs float owns the rationale, budget exclusions and stop criteria. Cream, olive-gray and apricot distinguish the proposal, comparison and review.',
      'zh-CN':
        'Vale 比较六周双路线步行试点、仅调研和全面推广三种方案。三页原生幻灯片呈现决策，现代文档浮动对象独立保存理由、预算排除项和停止条件。奶油白、橄榄灰和杏色区分提案、比较与复盘。',
    },
    tryIt: {
      'en-US': [
        'Double-click the memo on Decision and rationale to activate the native Docs editor.',
        'Edit its title or run the first README example. The slide headline and budget must not change.',
        'Scroll within the document to inspect budget exclusions and stop criteria. Plain typing and native Ctrl+Z/Ctrl+Y pass the source check; the fullscreen button currently opens no shell. Ctrl+Home with slash input remains unverified after a failed combined check.',
        'Visit Options and Review with the native thumbnails; return to the memo. Run the second README example to edit the host independently. Theme changes should preserve both models.',
      ],
      'zh-CN': [
        '双击 Decision and rationale 页中的备忘录，激活原生 Docs 编辑器。',
        '编辑文档标题或运行 README 第一段示例；幻灯片标题和预算不应变化。',
        '在文档内滚动查看预算排除项与停止条件。普通输入及原生 Ctrl+Z/Ctrl+Y 已通过源码检查；全屏按钮当前未打开容器。Ctrl+Home 与斜杠输入的组合检查失败，仍待单独验证。',
        '使用原生缩略图查看方案与复盘页，再返回备忘录。运行 README 第二段示例独立编辑宿主；切换主题应保留两套数据。',
      ],
    },
    expected: {
      'en-US':
        'This is a native SlideFloating document, not an iframe or a screenshot. The child is modern Docs, not a paginated traditional document or a slide text box. No fixture panel, backend, approval, invitations, booking or persistence. Reload restores the authored story. Full acceptance, including floating controls, is in progress; see README.',
      'zh-CN':
        '这是原生 SlideFloating 文档，不是 iframe 或截图。子单元是现代 Docs，不是传统分页文档或幻灯片文本框。不提供通用测试面板、后端、审批、邀请、预订或持久化；刷新恢复初始故事。浮动控件等完整验收正在进行，详见 README。',
    },
  },
  variants: [
    ['rationale', 'Editable rationale / Five sections', '可编辑理由 / 五个章节'],
    ['options', 'Three options / Different commitments', '三种方案 / 不同投入'],
    ['review', 'Review criteria / Independent narrative', '复盘条件 / 独立叙事'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['activate', 'Activate the document float', '激活浮动文档'],
    ['edit', 'Edit the memo and inspect native history', '编辑备忘录并检查原生历史'],
    ['navigate', 'Scroll the memo and navigate host slides', '滚动文档并切换宿主页面'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Presentation decision', '演示文稿决策'],
    ['child', 'Active modern document', '激活的现代文档'],
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
