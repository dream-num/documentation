import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'slides',
  previewHeight: 1040,
  category: 'features',
  group: { 'en-US': 'Deck structure', 'zh-CN': '演示文稿结构' },
  title: { 'en-US': 'Theme Bindings and Slide Backgrounds', 'zh-CN': '主题继承与单页背景' },
  description: {
    'en-US':
      'Explore eight authored night-market slides: Deep Ocean, airy violet, mint and coral, with native themes, backgrounds and Print.',
    'zh-CN': '直接浏览八页设计好的夜市简报：深海蓝、浅紫、薄荷与珊瑚色，使用原生主题、背景和打印菜单。',
  },
  tags: { 'en-US': ['Slides', 'Theme', 'Background', 'Client-side'], 'zh-CN': ['幻灯片', '主题', '背景', '客户端'] },
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
    'FUniver.getActivePresentation()',
    'FUniver.setUIVisible()',
    'FUniver.syncExecuteCommand()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Lumen is an original fictional night-market briefing: eighteen stalls, twenty-four host assignments and seventy-two survey responses. Its eight pages use seven arrangements. Color follows the supplied Deep Ocean reference without making every page dark. The theme-bound card changes with native presets; the Signal Cyan identity stays fixed. No fixture toolbar or diagnostic buttons cover the editor.',
      'zh-CN':
        'Lumen 是原创虚构夜市简报：十八个摊位、二十四个主持班次、七十二份调查反馈，八页采用七种排版。配色参考提供的 Deep Ocean，但不把所有页面都做成深色。主题卡片随原生预设变化，Signal Cyan 标识保持固定。不再用示例选择或诊断按钮遮挡编辑器。',
    },
    tryIt: {
      'en-US': [
        'Browse the native thumbnails: the first four pages demonstrate a dark solid fill, a cyan/lilac gradient, a mint pattern and an original coral/gold awning image.',
        'Choose native Themes presets. Compare the changing theme card with the fixed cyan identity and authored page background.',
        'Open Format Background. Reset Background restores the neutral master; native Undo/Redo reverse the edit. Native thumbnail navigation and theme selection add no undo entries.',
        'Open native Print settings. PPTX import/export is not included: the installed Exchange client requires a conversion service, which this frontend-only example does not configure.',
        'Reload the browser page to restore the authored deck. The real Univer and Facade are available as window.univer and window.univerAPI, as in the advanced SDK example.',
      ],
      'zh-CN': [
        '通过原生缩略图浏览：前四页展示深色纯色、青紫渐变、薄荷图案和原创珊瑚金色遮棚图片。',
        '选择原生 Themes 预设，比较变化的主题卡片、固定青色标识和预置页面背景。',
        '打开 Format Background。Reset Background 恢复中性母版，原生撤销重做恢复编辑；原生缩略图切页和主题选择不增加撤销记录。',
        '打开原生打印设置。本例不包含 PPTX 导入导出：当前 Exchange 客户端需要转换服务，纯前端案例不配置该服务。',
        '刷新浏览器恢复预置文稿。与 advanced SDK 示例一样，可通过 window.univer 和 window.univerAPI 使用真实内核及 Facade。',
      ],
    },
    expected: {
      'en-US':
        'Preview and downloadable source share the same factory and official CSS. The content palette is independent of the official editor chrome. Transparent text shapes remove decorative white boxes; each page retains a clear color hierarchy. Pattern rendering is an authored snapshot example: the installed panel has no pattern-selection radio. Trial watermarks remain. Plugin registration is not a guarantee of lossless conversion or complete print/browser compatibility.',
      'zh-CN':
        '预览与下载源码共用初始化工厂和官方 CSS。内容配色与官方编辑器界面分离。透明文本形状去掉装饰性白色框，让每页保持清晰的色彩层次。图案是预置快照展示：当前背景面板没有图案选择单选项。保留试用水印；注册插件不代表无损转换或所有打印、浏览器兼容性已通过。',
    },
  },
  variants: [
    ['solid', 'Deep Ocean', '深海蓝', 'Dark blue with Electric Blue and Signal Cyan.', '深蓝底搭配电光蓝与青色。'],
    [
      'gradient',
      'Cyan / Lilac',
      '青色／浅紫',
      'An airy two-color gradient with restrained accents.',
      '轻盈的双色渐变与克制的强调色。',
    ],
    [
      'pattern',
      'Mint / Blue',
      '薄荷／蓝色',
      'A quiet mint pattern with a blue focal point.',
      '安静的薄荷图案与蓝色视觉重点。',
    ],
    ['image', 'Coral / Gold', '珊瑚／金色', 'Original awning artwork on warm white.', '暖白底上的原创遮棚插画。'],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  actions: [
    ['pages', 'Native thumbnails', '原生缩略图', 'Browse the authored slides.', '浏览预置幻灯片。'],
    ['themes', 'Themes', '主题', 'Compare native preset previews.', '比较原生主题预设。'],
    ['background', 'Format Background', '背景面板', 'Edit or reset the page fill.', '编辑或重置页面填充。'],
    [
      'undo',
      'Native Undo / Redo',
      '原生撤销／重做',
      'Reverse background edits, not thumbnail navigation.',
      '恢复背景编辑，不恢复缩略图切页。',
    ],
    ['print', 'Native Print', '原生打印', 'Open the SDK print settings.', '打开 SDK 打印设置。'],
  ].map(([id, en, zh, ed, zd]) => ({
    id,
    label: { 'en-US': en, 'zh-CN': zh },
    description: { 'en-US': ed, 'zh-CN': zd },
  })),
  states: [
    ['default', 'Authored visual deck', '预置视觉文稿'],
    ['edited', 'Native theme or fill changed', '原生主题或填充已更改'],
    ['inherited', 'Neutral master background', '中性母版背景'],
    ['error', 'SDK or conversion limitation', 'SDK 或转换限制'],
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
