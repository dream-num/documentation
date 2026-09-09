import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'slides' as const,
  category: 'features' as const,
  image: '/assets/showcase/slides-images-fit-and-crop.png',
  group: { 'en-US': 'Images', 'zh-CN': '图片' },
  title: { 'en-US': 'Image Fit and Crop', 'zh-CN': '图片比例与裁剪' },
  description: {
    'en-US':
      'Three native slides compare proportional image frames, source cropping and replacement using original local artwork.',
    'zh-CN': '三张原生幻灯片使用原创本地图像，对比等比尺寸、源裁剪和图像替换。运行时为英文。',
  },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui'],
  tags: { 'en-US': ['Images', 'Crop', 'Aspect ratio'], 'zh-CN': ['图片', '裁剪', '比例'] },
  apis: [{ name: 'FSlide.insertImage() / getImages()' }, { name: 'FImage.setCrop() / setSize() / setSource()' }],
  guide: {
    overview: {
      'en-US':
        'Native image objects, original inline SVG sources and the SDK image crop panel. No duplicate host controls.',
      'zh-CN': '使用原生图片对象、原创内联 SVG 源和 SDK 图片裁剪面板，不添加重复宿主控件。',
    },
    tryIt: {
      'en-US': [
        'Navigate the three native thumbnails.',
        'Select an image and open Format Shape, then Position and Start Crop.',
        'Run the literal README recipes to resize, crop, replace or insert.',
      ],
      'zh-CN': [
        '通过原生缩略图切换三页。',
        '选择图片，打开 Format Shape，再选择 Position 和 Start Crop。',
        '运行 README 示例以调整尺寸、裁剪、替换或插入。',
      ],
    },
    expected: {
      'en-US':
        'Crop changes source visibility; proportional frames avoid stretching. Replacement via Facade retains geometry. Theme changes retain the same editor and edits. Native acceptance is reported separately.',
      'zh-CN':
        '裁剪改变可见源区域，等比边框避免拉伸。Facade 替换保留几何信息。主题切换保留编辑器与修改，原生验收单独记录。',
    },
  },
  actions: [],
  states: [],
  variants: [
    {
      id: 'fit',
      label: { 'en-US': 'Proportional frames', 'zh-CN': '等比尺寸' },
      description: { 'en-US': 'The full 3:2 source at two sizes.', 'zh-CN': '完整 3:2 图像的两种尺寸。' },
    },
    {
      id: 'crop',
      label: { 'en-US': 'Source crop', 'zh-CN': '源裁剪' },
      description: {
        'en-US': '25% off each side; central artwork remains.',
        'zh-CN': '左右各裁剪 25%，保留中央图像。',
      },
    },
    {
      id: 'replace',
      label: { 'en-US': 'Replacement', 'zh-CN': '替换' },
      description: { 'en-US': 'Different source, identical frame.', 'zh-CN': '不同图像源，相同边框。' },
    },
  ],
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
