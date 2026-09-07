import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/pdfs-ink-freehand-review.png',
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Markup', 'zh-CN': '标记' },
  title: { 'en-US': 'Ink and Freehand Review', 'zh-CN': '墨迹与自由手绘审阅' },
  description: {
    'en-US': 'Review an original floor plan with native PDF ink paths, stroke styles and reversible removal.',
    'zh-CN': '使用原生 PDF 墨迹路径、线条样式及可撤销的移除操作审阅原创平面图。',
  },
  tags: { 'en-US': ['PDFs', 'Ink', 'Freehand'], 'zh-CN': ['PDF', '墨迹', '手绘'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui'],
  apis: [
    { name: 'FUniver.createPdf()' },
    { name: 'FPdfPage.insertAnnotation() / getAnnotations()' },
    { name: 'FPdfAnnotation.getInk() / getStyle() / setStyle() / remove()' },
    { name: 'FUniver.undo() / redo()' },
    { name: 'FPdf.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A fictional Meridian studio plan has two labeled reference routes and a reviewer legend. Its original SVG is embedded in the PDF snapshot. Colored review strokes are separate durable PDF ink annotations, never HTML overlays or edits to the image.',
      'zh-CN':
        '虚构 Meridian 工作室平面图含两条带文字说明的参考路线及审阅图例；原创 SVG 内嵌于 PDF 快照。彩色审阅笔迹是独立持久化 PDF 墨迹注释，不是 HTML 覆盖层或图片修改。',
    },
    tryIt: {
      'en-US': [
        'Draw your own stroke with native Freehand drawing, then exit the tool.',
        'Select a stroke and inspect View > Properties.',
        'Use native Undo and Redo; compare the 12 executable README variants.',
      ],
      'zh-CN': [
        '使用原生自由画笔绘制笔迹，然后退出绘图工具。',
        '选择笔迹，在视图 > 属性中查看。',
        '使用原生撤销与重做，并比较 README 中的 12 段可运行变体。',
      ],
    },
    expected: {
      'en-US':
        'The original reference image and text remain intact. Ink geometry, style and native history belong to the SDK; theme changes preserve edits. The fictional plan is not safety advice.',
      'zh-CN':
        '原始参考图片和文字保持不变。墨迹几何、样式与原生历史由 SDK 管理；主题切换保留编辑。虚构平面图不构成安全建议。',
    },
  },
  actions: [
    {
      id: 'native-draw',
      label: { 'en-US': 'Draw and undo a review stroke', 'zh-CN': '绘制并撤销审阅笔迹' },
      description: {
        'en-US':
          'Use native Freehand drawing for pointer input, then native Undo and Redo to remove and restore the actual annotation.',
        'zh-CN': '使用原生自由画笔输入笔迹，再用原生撤销与重做移除和恢复实际注释。',
      },
    },
    {
      id: 'native-inspect',
      label: { 'en-US': 'Select and inspect properties', 'zh-CN': '选择并查看属性' },
      description: {
        'en-US':
          'Return to Selection mode and open View > Properties. Position readback is verified; changing X currently moves selection bounds but not ink pixels, so position editing remains a known failure.',
        'zh-CN':
          '返回选择模式，打开视图 > 属性。位置读回已验证；修改 X 目前只移动选择框而不移动墨迹像素，位置编辑仍为已知失败。',
      },
    },
    {
      id: 'run-guide',
      label: { 'en-US': 'Run the Facade variants', 'zh-CN': '运行 Facade 变体' },
      description: {
        'en-US':
          'Run the 12 README blocks in order on a fresh demo to compare colors, widths, disconnected paths, removal, native history and invalid-path rejection.',
        'zh-CN': '在全新案例中依次运行 README 的 12 段代码，比较颜色、线宽、分离路径、移除、原生历史与无效路径拒绝。',
      },
    },
  ],
  states: [
    {
      id: 'authored-review',
      label: { 'en-US': 'Authored review', 'zh-CN': '初始审阅' },
      description: {
        'en-US':
          'Three native ink annotations sit above the original embedded plan: a red circle, violet route and clay check.',
        'zh-CN': '原创内嵌平面图上有三个原生墨迹注释：红色圆圈、紫色路线与陶土色勾选。',
      },
    },
    {
      id: 'drawn-review',
      label: { 'en-US': 'New handwritten stroke', 'zh-CN': '新增手写笔迹' },
      description: {
        'en-US':
          'Native pointer drawing adds a durable ink path; native Undo removes it and Redo restores its geometry and painted pixels.',
        'zh-CN': '原生指针绘图新增持久化墨迹路径；原生撤销移除该路径，重做恢复其几何和实际像素。',
      },
    },
    {
      id: 'styled-review',
      label: { 'en-US': 'Edited stroke styles', 'zh-CN': '已修改笔迹样式' },
      description: {
        'en-US':
          'Facade color and width variants change actual ink appearance while preserving original text, image and path coordinates; theme changes retain edits.',
        'zh-CN': 'Facade 颜色和线宽变体改变实际墨迹外观，同时保留原文、图片及路径坐标；主题切换保留编辑。',
      },
    },
    {
      id: 'rejected-path',
      label: { 'en-US': 'Empty path rejected', 'zh-CN': '空路径被拒绝' },
      description: {
        'en-US':
          'The invalid README block throws the native Facade validation error and leaves the document snapshot unchanged.',
        'zh-CN': 'README 的无效输入代码抛出原生 Facade 校验错误，文档快照保持不变。',
      },
    },
  ],
  variants: [
    {
      id: 'paths',
      label: { 'en-US': 'Circle / route / check', 'zh-CN': '圆圈 / 路线 / 勾选' },
      description: {
        'en-US': 'Three durable ink paths with different business meanings and colors.',
        'zh-CN': '三种不同业务含义与配色的持久化墨迹路径。',
      },
    },
    {
      id: 'native',
      label: { 'en-US': 'Native pointer drawing', 'zh-CN': '原生指针绘制' },
      description: {
        'en-US': 'Real Freehand drawing, native selection, properties and history.',
        'zh-CN': '真实自由手绘、原生选择、属性和历史。',
      },
    },
    {
      id: 'style',
      label: { 'en-US': 'Color and width', 'zh-CN': '颜色与线宽' },
      description: {
        'en-US': 'Half-point and 12-point strokes retain their original coordinates.',
        'zh-CN': '半点与 12 点线宽保持原始坐标。',
      },
    },
    {
      id: 'multi-path',
      label: { 'en-US': 'Disconnected paths', 'zh-CN': '分离路径' },
      description: {
        'en-US': 'Two paths in one annotation share styling and object history.',
        'zh-CN': '一个注释中的两条路径共享样式及对象历史。',
      },
    },
    {
      id: 'validation',
      label: { 'en-US': 'Empty-path rejection', 'zh-CN': '拒绝空路径' },
      description: {
        'en-US': 'Native Facade validation rejects invalid paths without editing the plan.',
        'zh-CN': '原生 Facade 拒绝无效路径而不更改平面图。',
      },
    },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
