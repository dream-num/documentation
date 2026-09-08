import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/slides-shape-fill-and-outline.png',
  product: 'slides',
  category: 'features',
  previewHeight: 1040,
  group: { 'en-US': 'Elements', 'zh-CN': '元素' },
  title: { 'en-US': 'Shape Fill and Outline', 'zh-CN': '形状填充与轮廓' },
  description: {
    'en-US':
      'Four simple native slides compare fill, outline weight, shape, rotation and linear/radial gradients without a duplicate toolbar.',
    'zh-CN': '四页简单的原生幻灯片对照填充、轮廓粗细、形状、旋转及线性／径向渐变，不添加重复工具栏。',
  },
  tags: { 'en-US': ['Slides', 'Shapes', 'Fill', 'Outline'], 'zh-CN': ['幻灯片', '形状', '填充', '轮廓'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/slides-print', '@univerjs-pro/license'],
  apis: [
    'FSlide.getShape()',
    'FSlide.insertShape()',
    'FShape.setSolidFill()',
    'FShape.setNoneFill()',
    'FShape.setStrokeWidth()',
    'FShape.setRotation()',
    'FShape.setGradientFill()',
  ].map((name) => ({ name })),
  variants: [
    ['fills', 'Solid / none / outlined fill', '实色／无填充／填充与轮廓'],
    ['outlines', '1 / 4 / 8 pt outline', '1／4／8 pt 轮廓'],
    ['geometry', 'Rectangle / rounded / rotated', '矩形／圆角／旋转'],
    ['gradients', 'Linear 0° / linear 90° / radial', '线性 0°／线性 90°／径向'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [],
  guide: {
    overview: {
      'en-US':
        'A shape-level gallery, separate from page backgrounds and master layouts. All twelve samples are native editable shapes. Use thumbnails and the default Grid ribbon; source recipes use the installed public Facade.',
      'zh-CN':
        '此画廊说明对象级样式，与整页背景和母版布局分开。十二个样本均为可编辑原生形状。使用缩略图与默认 Grid 菜单；源码示例调用已安装版本的公开 Facade。',
    },
    tryIt: {
      'en-US': [
        'Compare the three samples on each slide.',
        'Select a colored shape, then use the native formatting tools.',
        'Run a README recipe in the console and compare the canvas result.',
      ],
      'zh-CN': ['逐页比较三个样本。', '选择彩色形状，使用原生格式工具。', '在控制台运行 README 示例，对照画布效果。'],
    },
    expected: {
      'en-US':
        'Content is deliberately small. Fill and outline are independent properties; rotation changes geometry, not page orientation. Preview and download use the same factory, complete English plugin locales and six official SDK stylesheets. No fixture or explanation panel is mounted. Trial limitations remain; binary conversion is not demonstrated.',
      'zh-CN':
        '内容刻意保持简单。填充与轮廓是独立属性；旋转改变形状而非页面方向。预览与下载共用工厂、完整英文插件语言包及六份官方 SDK 样式。不挂载 fixture 或说明面板。保留试用限制；不演示二进制文件转换。',
    },
  },
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
