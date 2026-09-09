import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Shapes in Documents', 'zh-CN': '文档中的形状' },
  description: {
    'en-US': 'Six editable native shapes: geometry, text, fill, outlines, rotation and text wrapping.',
    'zh-CN': '六个可编辑原生形状：几何、文字、填充、轮廓、旋转与文字环绕。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Shapes'], 'zh-CN': ['现代文档', '单功能', '形状'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-shape',
    '@univerjs-pro/docs-shape-ui',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/engine-formula',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertShape()',
    'FDocument.getShape()',
    'FShape.getText()',
    'FShape.setShapeData()',
    'FShape.setSize()',
    'FShape.setRotation()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'A simple native shape gallery with four inline geometries, an unfilled outline with square wrapping, and a pale background behind text. All samples remain editable in the native Grid ribbon and shape controls.',
      'zh-CN':
        '原生形状示例包含四种嵌入式几何形状、四周环绕的透明轮廓，以及文字后方的浅色背景。所有示例均可通过原生 Grid 功能区与形状控件编辑。',
    },
    tryIt: {
      'en-US': [
        'Select a shape and use its native format controls to change fill, outline or geometry.',
        'Edit the shape text, resize or rotate using native handles.',
        'Compare inline, square wrapping and behind-text placement; use the native Layers panel to arrange shapes.',
        'Insert or delete a shape and use native Undo/Redo.',
      ],
      'zh-CN': [
        '选择形状，在原生格式控件中修改填充、轮廓或几何。',
        '编辑形状文字，通过原生控制点缩放或旋转。',
        '比较嵌入式、四周环绕与文字后方，通过原生图层面板调整排列。',
        '插入或删除形状，使用原生撤销与重做。',
      ],
    },
    expected: {
      'en-US':
        'Preview and copied source share the same factory, official styles and complete English/Chinese locale bundles. Shapes are inserted through the public document Facade; the exported README includes editing recipes. Shape UI requires Pro Formula and License. Native trial notices remain visible. Theme changes preserve the document and edits. The previous beta.2 narrow-layout breakType failure is not repaired by this example; native layout errors remain observable and no custom document reflow is applied.',
      'zh-CN':
        '预览与复制源码共用工厂、官方样式和完整中英文语言包。通过公开文档 Facade 插入形状；导出的 README 包含编辑代码示例。形状 UI 依赖 Pro Formula 与 License。原生试用提示保持可见；主题切换保留文档与编辑。本示例没有修复先前 beta.2 窄屏排版的 breakType 错误，原生排版错误保持可见，也不执行自定义文档重排。',
    },
  },
  variants: ['rectangle', 'rounded-rectangle', 'ellipse', 'diamond', 'outline-square', 'behind-text'].map((id) => ({
    id,
    label: { 'en-US': id },
  })),
  actions: [
    'native-insert',
    'native-format',
    'native-text',
    'native-resize',
    'native-rotate',
    'native-wrap',
    'native-order',
    'native-delete',
    'native-undo-redo',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  states: ['default', 'edited', 'error'].map((id) => ({ id, label: { 'en-US': id } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
