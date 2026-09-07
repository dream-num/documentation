import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Images and Text Wrapping', 'zh-CN': '图片与文字环绕' },
  description: {
    'en-US':
      'Resize, crop, align and describe a coastal illustration; compare five wrapping styles in a real mixed-content memo.',
    'zh-CN': '在混合内容备忘录中调整海岸插图尺寸、裁剪、对齐与替代文本，比较五种环绕方式。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Images'], 'zh-CN': ['现代文档', '单功能', '图片'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/license',
  ],
  apis: [
    'InsertDocDrawingCommand',
    'FDocument.getImage()',
    'FDocumentImage.setSize()',
    'FDocumentImage.setWrappingStyle()',
    'FDocumentImage.setPositionH()',
    'FDocumentImage.setRotate()',
    'FDocumentImage.remove()',
    'UpdateDrawingDocTransformCommand',
    'RichTextEditingMutation',
    'ColumnResponsiveType.STACK',
    'DocViewScaleService.getViewScale()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Kestrel is an original fictional coastal recording team. An embedded CC0 illustration accompanies a long briefing paragraph, two recording-method columns, a station schedule and a clips chart. These independent elements expose unintended image-edit side effects.',
      'zh-CN':
        'Kestrel 是原创虚构海岸录音团队。内嵌 CC0 插图配有长说明段落、双栏方法对照、行程表与片段数量图表，用于检查图片修改对其他内容的影响。',
    },
    tryIt: {
      'en-US': [
        'Compare Responsive reflow with Fixed-width zoom. Narrow the window: text gains lines, method columns stack and table/chart widths adapt without consuming Undo history.',
        'Set descriptive alt text and inspect the actual image description.',
        'Compare Inline, Square, Top and bottom, Behind text and In front of text. Only floating modes use horizontal alignment.',
        'Try a recorder portrait or horizon panorama crop, then restore the full illustration.',
        'Resize and rotate; test Undo/Redo, deletion/reinsertion and snapshot reload.',
        'Try invalid sizes, empty alt text and actions on an empty document. Reset restores the frozen original memo.',
      ],
      'zh-CN': [
        '对比响应式重排与固定宽度缩放：缩窄窗口后文字增加行数、方法分栏堆叠、表格和图表变窄，且不占用撤销历史。',
        '设置替代文本并检查真实图片 description。',
        '比较五种环绕模式；只有浮动图片使用水平对齐。',
        '比较录音机竖幅、地平线横幅裁剪并恢复完整图片。',
        '调整尺寸与旋转，测试撤销重做、删除再插入与快照重载。',
        '测试非法尺寸、空替代文本与空文档操作；Reset 恢复原始案例。',
      ],
    },
    expected: {
      'en-US':
        'Preview and copied source run the same implementation. Responsive mode keeps view scale at 1 and applies real page, table and chart widths with noHistory document mutations. The SDK stacks columns below their combined minimum width. Fixed-width mode keeps the original line breaks and uses SDK fit-to-width scaling. Explicit image dimensions are preserved, so intentionally oversized images may overflow the text column. Alt text uses a registered host command and SDK mutation for Undo/Redo; metadata is not canvas screen-reader certification. Crop offsets are pixels. Known beta.2 issue: a combined crop-and-size command scales renderer crop offsets again (60 becomes 30), while the document retains the requested crop. The strict crop gate still fails; responsive acceptance does not erase that gap. Drawing setup waits for Rendered.',
      'zh-CN':
        'Preview 与复制源码共用实现。响应模式保持视图比例为 1，通过 noHistory 文档 mutation 调整真实页面、表格和图表宽度；SDK 在栏目最小宽度不足时自动堆叠。固定宽度模式保留原始换行，使用 SDK 适宽缩放。图片保留用户明确设置的尺寸，因此过宽图片可能超出文字栏。替代文本通过注册的宿主命令和 SDK mutation 支持撤销重做，元数据不等于画布读屏认证。裁剪偏移为像素；beta.2 的合并裁剪与尺寸命令仍会再次缩放渲染偏移（60 变为 30），文档却保留原值。严格裁剪测试仍失败，响应式验收不掩盖此缺口。绘图等待 Rendered 后初始化。',
    },
  },
  variants: [
    'responsive-reflow',
    'fixed-width-zoom',
    'inline',
    'square',
    'top-and-bottom',
    'behind-text',
    'in-front-of-text',
    'recorder-crop',
    'horizon-crop',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  actions: [
    'insert',
    'wrap',
    'resize',
    'align',
    'crop',
    'alt',
    'rotate',
    'delete',
    'show',
    'chart',
    'undo',
    'redo',
    'inspect',
    'roundtrip',
    'empty',
    'reset',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  states: ['default', 'edited', 'empty', 'error'].map((id) => ({ id, label: { 'en-US': id } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
