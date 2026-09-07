import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Blocks', 'zh-CN': '内容块' },
  title: { 'en-US': 'Links and Bookmarks', 'zh-CN': '链接与书签' },
  description: {
    'en-US':
      'Edit external links and navigate stored SDK bookmarks in an original tool-library brief, with explicit host routing.',
    'zh-CN': '在原创工具借阅简报中编辑外链、导航 SDK 书签，并明确展示宿主路由接线。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Navigation'], 'zh-CN': ['现代文档', '单功能', '导航'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-hyper-link',
    '@univerjs-pro/docs-code',
    '@univerjs-pro/docs-code-ui',
    '@univerjs-pro/docs-callout',
    '@univerjs-pro/docs-callout-ui',
    '@univerjs-pro/docs-list',
    '@univerjs-pro/docs-list-ui',
    '@univerjs-pro/docs-quote',
    '@univerjs-pro/docs-quote-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FUniver.executeCommand()',
    'docs.command.add-hyper-link',
    'docs.command.update-hyper-link',
    'docs.command.delete-hyper-link',
    'addCustomRangeBySelectionFactory()',
    'deleteCustomRangeFactory()',
    'FDocument.save()',
    'FDocument.setSelection()',
    'DocBackScrollRenderController.scrollToRange()',
    'window.open()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Atlas is a fictional neighborhood tool library. Its six-section brief includes a workshop manual, a summary link to Returns desk, an untouched calendar reference, two checklist items, two tasks, a caution, a reminder code block and a volunteer quote. Returns desk and Volunteer handoff are distinct bookmark targets. All content is original and reproducible.',
      'zh-CN':
        'Atlas 是虚构社区工具借阅库。六节原创简报包含工具手册、返回台摘要链接、独立日历对照、两条清单、两项任务、提示、提醒代码与志愿者引用。返回台和志愿者交接是两个不同书签目标。',
    },
    tryIt: {
      'en-US': [
        'Read the workshop target, edit its label and HTTP(S) address, then apply. The independent calendar must not change.',
        'Remove a link without deleting its text, then link that text again. The SDK generates a new range ID; the demo rediscovers it from the current paragraph.',
        'Create the Volunteer handoff bookmark and link the summary to it. Choose Summary link and Open target (host); selection and scroll should reach the bookmarked heading.',
        'Insert a lead-in paragraph, then navigate again. The destination must follow its SDK range, not a cached character offset.',
        'Remove a bookmark and open the unresolved summary link. The error must be explicit and the heading must remain.',
        'Try whitespace-only labels, unsafe URL schemes, credential URLs and missing IDs. Inspect, Undo/Redo, reload the snapshot, empty the document and Reset.',
      ],
      'zh-CN': [
        '读取工具手册目标，修改标签与 HTTP(S) 地址并应用；日历对照不得改变。',
        '删除链接但保留文字，再为文字添加链接；SDK 生成新范围 ID，示例从当前段落重新定位。',
        '创建交接书签并让摘要链接指向它，选择摘要目标并点击 Open target (host)，核对实际选区与滚动。',
        '插入前置段落后再次导航；目标应跟随 SDK 范围移动，而不是沿用缓存字符位置。',
        '移除书签后打开悬空摘要链接，应明确报错且保留标题。',
        '测试空白标签、不安全协议、含凭据 URL、缺失 ID，再检查撤销重做、快照重载、空文档与重置。',
      ],
    },
    expected: {
      'en-US':
        'Preview and source share one factory. External edits call the hyperlink plugin commands; bookmark creation/removal uses exported Docs custom-range factories and SDK mutations. Open target is host integration, not native bookmark support: it reads a #bookmark= URL, resolves the live SDK range, selects its text and requests SDK scrolling. The native link popup opens URLs and does not implement this routing. No browser-open override or fake editor is installed. Only HTTP(S) without credentials and this bookmark syntax are allowed by the host; browser popup policies apply. Native popup security/routing is not certified by the host checks. Fresh runtime IDs avoid stale state on reset; narrow screens use fit-width zoom, and trial watermarks remain. Capability acceptance is recorded separately.',
      'zh-CN':
        'Preview 与源码共用实现。外链编辑调用插件命令；书签增删使用 Docs 导出的范围工厂和 SDK mutation。Open target 是宿主集成，不是原生书签功能：解析 #bookmark=，定位实时 SDK 范围，选择正文并请求 SDK 滚动。原生链接弹层仅打开 URL，不执行该路由；没有覆盖浏览器打开函数或伪造编辑器。宿主仅允许无凭据 HTTP(S) 及约定书签语法，浏览器弹窗策略仍有效；宿主校验不代表原生弹层的安全或路由验收。重置使用新运行时 ID，窄屏适宽缩放，试用水印保留。能力验收独立记录。',
    },
  },
  variants: [
    'external-http',
    'external-https',
    'query-and-fragment',
    'returns-bookmark',
    'handoff-bookmark',
    'unresolved-bookmark',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  actions: [
    'load',
    'update',
    'add',
    'select',
    'remove',
    'open',
    'bookmark',
    'unbookmark',
    'anchor',
    'prefix',
    'missing',
    'undo',
    'redo',
    'inspect',
    'roundtrip',
    'empty',
    'reset',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  states: ['default', 'edited', 'unlinked', 'bookmarked', 'unresolved', 'empty', 'error'].map((id) => ({
    id,
    label: { 'en-US': id },
  })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
