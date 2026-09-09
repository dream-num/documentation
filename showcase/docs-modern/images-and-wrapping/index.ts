import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Images and Text Wrapping', 'zh-CN': '图片与文字环绕' },
  description: {
    'en-US': 'Ten native image specimens compare wrapping, alignment, size, rotation and crop boundaries.',
    'zh-CN': '十组原生图片样张对照环绕、对齐、尺寸、旋转和裁剪边界。',
  },
  tags: { 'en-US': ['Modern Docs', 'Images', 'Wrapping'], 'zh-CN': ['现代文档', '图片', '环绕'] },
  packages: ['@univerjs/preset-docs-core', '@univerjs/preset-docs-drawing'],
  apis: [
    'InsertDocDrawingCommand',
    'FDocument.getImage()',
    'FDocumentImage.setWrappingStyle()',
    'FDocumentImage.setSize()',
    'FDocumentImage.setRotate()',
    'FDocumentImage.setPositionH()',
    'UpdateDrawingDocTransformCommand',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'One original local illustration is repeated as native document images. Identical surrounding text makes layout differences visible without property panels.',
      'zh-CN': '同一原创本地插图以原生文档图片展示；相同周围文字直接呈现布局差异，无需属性演示面板。',
    },
    tryIt: {
      'en-US': [
        'Scroll through inline, square left/center/right, top-and-bottom and text-layer examples.',
        'Select an image to use native image controls for further edits. Compare the smaller rotated specimen with the original.',
        'Inspect portrait/panorama crops. Their SDK crop-offset defect is retained and documented, not treated as a passed visual result.',
      ],
      'zh-CN': [
        '滚动对照嵌入型、四周型左中右、上下型和文字前后层级。',
        '选择图片使用原生图片控件继续编辑，对照缩小旋转样张与原图。',
        '检查竖幅与横幅裁剪；保留并记录 SDK 裁剪偏移缺陷，不将其作为视觉验收通过。',
      ],
    },
    expected: {
      'en-US':
        'No host fixture, history or readback panels. Official Core/Drawing CSS and complete EN/ZH packs are exported. Image descriptions are stored metadata, not a screen-reader certification. Known beta.2 crop issue: combined crop/size updates rescale renderer offsets again while the document retains requested values.',
      'zh-CN':
        '不提供宿主状态、历史或读回面板；导出官方 Core/Drawing CSS 与完整中英文包。图片描述是元数据，不是读屏认证。beta.2 已知问题：合并裁剪与尺寸更新会再次缩放渲染偏移，而文档保留请求值。',
    },
  },
  variants: [
    ['inline', 'Inline', '嵌入型'],
    ['square-left', 'Square · left', '四周型 · 左对齐'],
    ['square-center', 'Square · center', '四周型 · 居中'],
    ['square-right', 'Square · right', '四周型 · 右对齐'],
    ['top-bottom', 'Top and bottom', '上下型'],
    ['behind', 'Behind text', '衬于文字下方'],
    ['front', 'In front of text', '浮于文字上方'],
    ['rotated', 'Size and rotation', '尺寸与旋转'],
    ['recorder-crop', 'Recorder crop', '录音机裁剪'],
    ['horizon-crop', 'Horizon crop', '地平线裁剪'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
