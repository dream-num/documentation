import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'embed',
  category: 'features',
  previewHeight: 1100,
  group: { 'en-US': 'Slides host / Tab', 'zh-CN': 'Slides 宿主 / 文档页' },
  title: { 'en-US': 'Docs in Slides / Research Appendix Tab', 'zh-CN': 'Docs 嵌入 Slides / 研究附录标签' },
  description: {
    'en-US':
      'Open a complete modern research appendix as a native presentation page, with methods, sample details and explicit limitations.',
    'zh-CN': '将完整现代文档研究附录作为演示文稿原生页面，展示方法、样本细节与明确限制。',
  },
  tags: {
    'en-US': ['Embed', 'Slides', 'Docs', 'Tab', 'Research'],
    'zh-CN': ['嵌入', '幻灯片', '文档', '标签', '研究'],
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
    'EmbedCreationService.prepareCreateEmbed()',
    'EmbedHostRestoreService.materializeDescriptor()',
    'EmbedHostRestoreService.restoreEmbed()',
    'FDocument.getParagraphs()',
    'FDocumentParagraph.setText()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Mosaic combines three original research slides with a full-size modern Docs appendix in the native page list. Eighteen interviews across three workshops produce four different barrier counts. The appendix preserves methods and limitations without squeezing them into a floating card.',
      'zh-CN':
        'Mosaic 将三页原创研究汇报与原生页面列表中的完整现代 Docs 附录结合。三个工作坊的十八次访谈产生四种不同障碍计数；附录独立展示方法和限制，不压缩成浮动卡片。',
    },
    tryIt: {
      'en-US': [
        'Open Research appendix from the native slide list. The document fills the content area; no floating frame or iframe is used.',
        'Edit its title or run the first README example. Use native keyboard Undo/Redo to check document history independently of slide history.',
        'Scroll to Limitations and Next learning step. Return to the research slides and compare counts 7, 5, 4 and 2.',
        'Run the second README example to edit the host headline. Change theme and return to the appendix; both edited models should remain intact.',
      ],
      'zh-CN': [
        '从原生幻灯片列表打开 Research appendix，文档占据内容区，不使用浮动框或 iframe。',
        '编辑文档标题或运行 README 第一段示例；使用原生键盘撤销重做检查文档与幻灯片历史的独立性。',
        '滚动到 Limitations 和 Next learning step，返回汇报页面比较 7、5、4、2 四组计数。',
        '运行 README 第二段示例修改宿主标题，切换主题并返回附录，两套已编辑数据都应保留。',
      ],
    },
    expected: {
      'en-US':
        'A native Slides page-list block hosts a real modern document, distinct from Float and traditional paginated Docs. Counts are authored, not formula-linked. No fixture panel, backend, participant contact, approvals or persistence. Reload restores the original study. Full runtime acceptance remains in progress; see README.',
      'zh-CN':
        '原生 Slides 页面列表块承载真正的现代文档，与 Float 和传统分页 Docs 分开。计数为编写内容，不使用公式关联。不提供通用测试面板、后端、参与者联系、审批或持久化；刷新恢复初始研究。完整运行验收仍在进行，详见 README。',
    },
  },
  variants: [
    ['question', 'Research question / Three workshops', '研究问题 / 三个工作坊'],
    ['methods', 'Methods and limitations / Six sections', '方法与限制 / 六个章节'],
    ['patterns', 'Four barrier counts / Explicit caveats', '四组障碍计数 / 明确限制'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['open', 'Open the native document page', '打开原生文档页'],
    ['edit', 'Edit the appendix and use native history', '编辑附录并使用原生历史'],
    ['navigate', 'Scroll evidence and return to the research', '滚动证据并返回汇报'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['host', 'Research presentation', '研究演示文稿'],
    ['child', 'Active modern appendix', '激活的现代附录'],
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
