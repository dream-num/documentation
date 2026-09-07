import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/pdfs-image-placement-crop.png',
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Images', 'zh-CN': '图片' },
  title: { 'en-US': 'Image Placement and Cropping', 'zh-CN': '图片排版与裁剪' },
  description: {
    'en-US': 'Replace seasonal artwork, change geometry, crop and fade a real PDF image through Facades.',
    'zh-CN': '通过 Facade 替换季节插图，修改真实 PDF 图片的几何、裁剪和透明度。',
  },
  tags: { 'en-US': ['PDFs', 'Images', 'Crop'], 'zh-CN': ['PDF', '图片', '裁剪'] },
  packages: ['@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui'],
  apis: [
    { name: 'FPdfPage.newImage() / insertImage() / getImages()' },
    { name: 'FPdfImage.setSource() / getSource()' },
    { name: 'FPdfImage.setTransform() / getTransform()' },
    { name: 'FPdfImage.setCrop() / getCrop() / setOpacity() / getOpacity() / remove()' },
    { name: 'FUniver.undo() / redo() / createPdf()' },
    { name: 'FPdf.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'An original Ridgeway proof pairs native captions with an embedded summer image. Winter artwork is supplied as a distinct source variant; operations target real PDF image objects.',
      'zh-CN':
        '原创 Ridgeway 校样将原生说明文字与内嵌夏季图片组合。冬季插图作为不同素材变体提供，操作针对真实 PDF 图片对象。',
    },
    tryIt: {
      'en-US': [
        'Select the illustration and inspect native Properties.',
        'Edit native position fields and compare the result with Undo/Redo.',
        'Run the README variants for summer/winter, crop, geometry and opacity; heed the known removal failure and drag-readback limit.',
      ],
      'zh-CN': [
        '选择插图并查看原生属性。',
        '编辑原生位置属性，使用撤销与重做比较结果。',
        '运行 README 变体比较夏冬素材、裁剪、几何与透明度；注意已知移除失败及拖动读回限制。',
      ],
    },
    expected: {
      'en-US':
        'Image edits preserve surrounding text. Crop retains original source bytes and is not redaction; theme changes preserve edits. See strict runtime evidence for unverified capabilities.',
      'zh-CN': '图片编辑保留周围文字。裁剪保留原始素材字节，不是脱敏；主题切换保留编辑。未验证能力以严格运行报告为准。',
    },
  },
  actions: [
    {
      id: 'native-properties',
      label: {
        'en-US': 'Select / position / drag',
        'zh-CN': '选择 / 定位 / 拖动',
      },
      description: {
        'en-US':
          'Native Properties position editing and history are verified. Dragging paints movement but currently leaves the Facade transform stale.',
        'zh-CN': '原生属性位置编辑和历史已验证。拖动可移动画面，但目前 Facade 变换读数未同步。',
      },
    },
    {
      id: 'native-crop',
      label: {
        'en-US': 'Facade crop / native history',
        'zh-CN': 'Facade 裁剪 / 原生历史',
      },
      description: {
        'en-US':
          'Use the README crop blocks and native history. The installed image Properties/context menu does not expose a Crop image control.',
        'zh-CN': '使用 README 裁剪代码和原生历史。当前安装版本的图片属性及右键菜单没有裁剪图片控件。',
      },
    },
    {
      id: 'readme',
      label: {
        'en-US': 'Run source-code variants',
        'zh-CN': '运行源码变体',
      },
      description: {
        'en-US':
          'Fourteen verified Facade blocks cover source changes, crops, transform, opacity and validation. The final removal block and dependent Undo remain explicitly failing/unverified.',
        'zh-CN':
          '14 段已验证 Facade 代码覆盖素材替换、裁剪、变换、透明度和校验。末尾的移除代码及依赖它的撤销明确保留为失败或未验证。',
      },
    },
  ],
  states: [
    {
      id: 'authored',
      label: {
        'en-US': 'Summer proof',
        'zh-CN': '夏季校样',
      },
      description: {
        'en-US': 'Full-color artwork appears in a 450 × 270 point frame with separate native text.',
        'zh-CN': '完整配色插图位于 450 × 270 点图片框中，与原生文字相互独立。',
      },
    },
    {
      id: 'cropped',
      label: {
        'en-US': 'Detail crop',
        'zh-CN': '局部裁剪',
      },
      description: {
        'en-US': 'A relative image crop shows selected landmarks while retaining the complete source.',
        'zh-CN': '相对图片裁剪显示选定地标，同时保留完整素材。',
      },
    },
    {
      id: 'invisible',
      label: {
        'en-US': 'Invisible, not removed',
        'zh-CN': '隐形但未移除',
      },
      description: {
        'en-US': 'Opacity zero hides the painting; the image remains in the PDF model and can be restored.',
        'zh-CN': '透明度为零隐藏绘制，图片仍保留在 PDF 模型中，可恢复显示。',
      },
    },
    {
      id: 'rejected',
      label: {
        'en-US': 'Empty crop rejected',
        'zh-CN': '空裁剪被拒绝',
      },
      description: {
        'en-US': 'Native validation rejects a zero-width crop without changing the document snapshot.',
        'zh-CN': '原生校验拒绝零宽度裁剪，文档快照保持不变。',
      },
    },
  ],
  variants: [
    {
      id: 'source',
      label: {
        'en-US': 'Summer / winter',
        'zh-CN': '夏季 / 冬季',
      },
      description: {
        'en-US': 'Two original embedded illustrations differ in color and landmarks.',
        'zh-CN': '两张原创内嵌插图具有不同颜色和地标。',
      },
    },
    {
      id: 'crop',
      label: {
        'en-US': 'Full / left / right',
        'zh-CN': '完整 / 左半 / 右半',
      },
      description: {
        'en-US': 'Compare full scenery with two detail windows in the same placement frame.',
        'zh-CN': '在同一图片框中比较完整场景与两种局部窗口。',
      },
    },
    {
      id: 'transform',
      label: {
        'en-US': 'Move / resize / rotate',
        'zh-CN': '移动 / 缩放 / 旋转',
      },
      description: {
        'en-US': 'Actual PDF-point placement and clockwise rotation, not host CSS transforms.',
        'zh-CN': '真实 PDF 点排版与顺时针旋转，不是宿主 CSS 变换。',
      },
    },
    {
      id: 'opacity',
      label: {
        'en-US': 'Opaque / faded / invisible',
        'zh-CN': '不透明 / 淡化 / 隐形',
      },
      description: {
        'en-US': 'Compare opacity 1, 0.35 and 0 without replacing the image object.',
        'zh-CN': '不替换图片对象，比较透明度 1、0.35 和 0。',
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
