import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'slides',
  previewHeight: 960,
  category: 'features',
  group: { 'en-US': 'Text and elements', 'zh-CN': '文本与元素' },
  title: { 'en-US': 'Text Editing and Autofit Limits', 'zh-CN': '文本编辑与自适应限制' },
  description: {
    'en-US':
      'Three authored print-studio pages demonstrate rich-text emphasis, native lists and paragraph alignment. Edit directly in the native Grid editor; autofit limits remain disclosed.',
    'zh-CN':
      '三页印刷工作室内容展示富文本强调、原生列表和段落对齐。直接在原生 Grid 编辑器中编辑，并明确说明自适应限制。',
  },
  tags: { 'en-US': ['Slides', 'Text', 'Rich text', 'Autofit'], 'zh-CN': ['幻灯片', '文本', '富文本', '自适应'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
    '@univerjs-pro/license',
    '@univerjs-pro/slides-print',
  ],
  apis: [
    'FUniver.createPresentation()',
    'RichTextBuilder.span()',
    'RichTextBuilder.paragraph()',
    'RichTextBuilder.listItem()',
    'FUniver.getActivePresentation()',
    'FUniver.setUIVisible()',
    'FUniver.syncExecuteCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Saffron is an original fictional community print studio. Its welcome card, workshop menu and invitation use coral/cream, mint and lilac palettes. The real pages demonstrate formatting immediately: no fixture selector, draft form, duplicate formatting buttons or Inspect panel. Preview and export share the same factory, authored data and six official SDK CSS imports.',
      'zh-CN':
        'Saffron 是原创虚构社区印刷工作室。欢迎卡、工作坊菜单和邀请函分别采用珊瑚奶油色、薄荷绿和丁香紫。打开即可看到实际排版，不再提供 fixture 选择器、草稿表单、重复格式按钮或 Inspect 面板。预览与导出共用工厂、案例数据和六份官方 SDK CSS。',
    },
    tryIt: {
      'en-US': [
        'Use the native thumbnails to compare all three pages: mixed size/weight/color, a three-item native list, and left/center/right paragraphs.',
        'Double-click text on the canvas to edit it. Select a text range to explore the native contextual formatting controls.',
        'Use native Undo and Redo after an edit. Thumbnail navigation itself does not create a history entry.',
        'Open the native Print settings. Conversion and full print-output fidelity are separate acceptance items; menu presence alone is not proof.',
        'In the exported source, createData also accepts overflow, blank and empty for developer diagnostics. These are source-level inputs, not hidden fixture controls.',
      ],
      'zh-CN': [
        '使用原生缩略图比较三页：混合字号、字重与颜色，三项原生列表，以及左、中、右段落对齐。',
        '双击画布文字进行编辑，选中文字范围探索原生上下文格式控件。',
        '编辑后使用原生撤销和重做；缩略图导航本身不产生历史记录。',
        '打开原生打印设置。转换和完整打印输出保真度需要单独验收，菜单出现不等于功能已验证。',
        '导出源码中的 createData 还接受 overflow、blank 和 empty，供开发者诊断；它们是源码参数，不是隐藏的 fixture 控件。',
      ],
    },
    expected: {
      'en-US':
        'Each page retains distinct text and layout. The list uses native list metadata, not typed bullet characters. Canvas fit changes the viewing zoom only; it never simulates text autofit. In retained beta.2 renderer checks, normAutoFit and spAutoFit options were stored but did not visibly shrink text or grow the shape. That limitation remains open. Reload the browser to restore authored data. Trial watermarks remain. Broad native editing, accessibility, lifecycle faults and print-output fidelity are still under verification.',
      'zh-CN':
        '每页保留不同文本和排版，列表使用原生列表元数据而非手工输入的圆点。画布适配只调整查看缩放，不模拟文本自适应。保留的 beta.2 渲染检查表明 normAutoFit 和 spAutoFit 参数会保存，但未可见地缩小文字或扩大形状；该限制仍未解决。刷新浏览器可恢复原始内容，保留试用水印。完整原生编辑、无障碍、生命周期故障和打印输出保真度仍待验收。',
    },
  },
  variants: [
    [
      'welcome',
      'Emphasis / Coral studio',
      '强调 / 珊瑚工作室',
      'Mixed font sizes, bold and italic spans on a warm reading surface.',
      '暖色阅读底上的混合字号、加粗与斜体片段。',
    ],
    [
      'workshops',
      'Lists / Tidal mint',
      '列表 / 薄荷绿',
      'Three native list items describe four, five and three volunteer hosts.',
      '三项原生列表分别介绍四、五、三名志愿主持安排。',
    ],
    [
      'invitation',
      'Alignment / Soft lilac',
      '对齐 / 丁香紫',
      'Left, center and right paragraphs share a single editable text box.',
      '同一可编辑文本框内的左、中、右对齐段落。',
    ],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  actions: [
    [
      'navigate',
      'Native thumbnails',
      '原生缩略图',
      'Browse authored pages without a duplicate selector.',
      '直接浏览案例页面，无重复选择器。',
    ],
    [
      'edit',
      'Edit on canvas',
      '画布内编辑',
      'Double-click the actual text; use native contextual formatting.',
      '双击实际文本，使用原生上下文格式菜单。',
    ],
    [
      'history',
      'Native Undo / Redo',
      '原生撤销 / 重做',
      'Inspect the result of your edits with native local history.',
      '使用原生本地撤销重做检查编辑结果。',
    ],
    [
      'print',
      'Native Print',
      '原生打印',
      'Explore the registered print settings; output fidelity is not yet accepted.',
      '探索已注册的打印设置，输出保真度尚未验收。',
    ],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  states: [
    ['default', 'Three authored pages', '三页案例内容'],
    ['edited', 'Native text or formatting changed', '原生文本或格式已修改'],
    ['limitation', 'Autofit renderer limitation remains open', '自适应渲染限制仍未解决'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
