import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'slides' as const,
  category: 'showcases' as const,
  image: '/assets/showcase/slides-product-launch.png',
  group: { 'en-US': 'Launch and storytelling', 'zh-CN': '发布与叙事' },
  title: { 'en-US': 'Product Launch', 'zh-CN': '产品发布' },
  description: {
    'en-US': 'Explore an eleven-page product story in the native editor and update a rollout milestone with the SDK.',
    'zh-CN': '在原生编辑器中浏览十一页产品故事，并通过 SDK 更新发布里程碑。',
  },
  tags: { 'en-US': ['Slides', 'Launch', 'Timeline'], 'zh-CN': ['演示文稿', '发布', '时间线'] },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/docs',
    '@univerjs/docs-ui',
    '@univerjs/drawing',
    '@univerjs/engine-render',
    '@univerjs/ui',
    '@univerjs-pro/license',
    '@univerjs-pro/engine-shape',
    '@univerjs-pro/shape-editor-ui',
    '@univerjs-pro/slides',
    '@univerjs-pro/slides-ui',
  ],
  apis: [
    { name: 'FUniver.createPresentation()' },
    { name: 'FPresentation.setActiveSlide()' },
    { name: 'UpdateSlideDrawingCommand' },
    { name: 'FPresentation.save()' },
    { name: 'SetSlideZoomRatioOperation' },
    { name: 'applyShapeTextAlignment()' },
    { name: 'applyTextToShapeText()' },
    { name: 'FSlide.newImage() / FImageBuilder.build()' },
    { name: 'FSlide.deleteElement() / FSlide.insertImage()' },
    { name: 'FShape.getText().setText()' },
    { name: 'FPageElement.setAbsolutePosition()' },
    { name: 'FSlide.setSpeakerNotes()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Eleven original fictional slides cover three personas, four pain points, five capabilities, six milestones, illustrative pilot measures, launch scope and readiness targets. Metrics are synthetic, not real customer evidence.',
      'zh-CN':
        '十一页原创虚构内容包含三类角色、四个痛点、五项能力、六个里程碑、示意试点指标、发布范围与就绪目标。指标为合成数据，不是真实客户证据。',
    },
    tryIt: {
      'en-US': [
        'Browse all eleven original pages with native thumbnails; edit the title, speaker notes and positions.',
        'Run the literal README GA batch and current-model guards, then compare complete Undo/Redo snapshots.',
        'Save first, then open the original four-page starter or eleven-page local-media variant with the documented integration handle.',
        'Validate a local PNG/JPEG, compare landscape/portrait aspect-fit, download JSON and reconstruct the exact same presentation ID.',
      ],
      'zh-CN': [
        '使用原生缩略图浏览十一页原创内容，编辑标题、演讲备注和位置。',
        '运行 README 中 GA 批处理及当前模型保护，比较完整撤销重做快照。',
        '先保存，再通过已说明的集成入口打开原始四页起始稿或十一页本地媒体变体。',
        '校验本地 PNG/JPEG，比较横竖图片等比例适配，下载 JSON 并以完全相同 ID 重建文稿。',
      ],
    },
    expected: {
      'en-US':
        'Native Grid only; no fixture/edit/history/readback toolbar. Five official CSS files and five complete EN/ZH packs share one factory. Theme changes retain edits. Original IDs, notes and business facts remain. GA label and marker move together with live-model guards. Original starter, empty page and local-media variants remain in literal recipes. PNG/JPEG MIME/signature/size/decode/dimension checks occur before mutation; image bytes remain local. Whole-owner restore preserves the saved ID and is not Undo. Raw history and cross-type media failures are retained; no internal undo grouping or normalization. Native zoom is available; automatic narrow-screen fit is not claimed. JSON downloads are not PPTX; trial watermarks remain.',
      'zh-CN':
        '仅保留原生 Grid，没有样本、编辑、历史或读回工具栏。五份官方 CSS 与五套完整中英文包共用一个 factory；主题切换保留编辑。原 ID、备注和业务事实保持。GA 标签与标记通过当前模型保护一起移动。原起始稿、空白页和本地媒体变体保留为逐段代码。修改前校验 PNG/JPEG 类型、签名、大小、解码和尺寸，图片字节仅留本地。整体恢复保留已保存 ID，不等于撤销。保留原始历史和跨类型媒体失败，不使用内部历史分组或字段归一化。提供原生缩放，不宣称自动窄屏适宽。JSON 下载不是 PPTX，试用水印仍保留。',
    },
  },
  variants: [
    { id: 'story', label: { 'en-US': 'Product story', 'zh-CN': '产品故事' } },
    { id: 'rollout', label: { 'en-US': 'Rollout timeline', 'zh-CN': '发布时间线' } },
    { id: 'starter', label: { 'en-US': 'Four-page starter deck', 'zh-CN': '四页起始文稿' } },
    { id: 'media', label: { 'en-US': 'Replaceable local media', 'zh-CN': '可替换的本地媒体' } },
  ],
  actions: [
    { id: 'show-rollout', label: { 'en-US': 'Show rollout', 'zh-CN': '显示发布计划' } },
    { id: 'move-ga', label: { 'en-US': 'Move GA seven days', 'zh-CN': 'GA 推迟七天' } },
    { id: 'starter', label: { 'en-US': 'New starter deck', 'zh-CN': '新建起始文稿' } },
    { id: 'restore', label: { 'en-US': 'Restore captured data', 'zh-CN': '恢复已保存数据' } },
    { id: 'show', label: { 'en-US': 'Show slide', 'zh-CN': '显示页面' } },
    { id: 'fit', label: { 'en-US': 'Native slide zoom', 'zh-CN': '原生页面缩放' } },
    { id: 'inspect', label: { 'en-US': 'Read native model', 'zh-CN': '读取原生模型' } },
    { id: 'snapshot', label: { 'en-US': 'Download snapshot', 'zh-CN': '下载快照' } },
    { id: 'metrics', label: { 'en-US': 'Download metrics', 'zh-CN': '下载指标' } },
    { id: 'media', label: { 'en-US': 'Missing media variant', 'zh-CN': '缺失媒体变体' } },
    { id: 'local-image', label: { 'en-US': 'Choose local image', 'zh-CN': '选择本地图片' } },
    { id: 'reload', label: { 'en-US': 'Reload snapshot', 'zh-CN': '重新加载快照' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': 'GA Mar 03', 'zh-CN': 'GA 3 月 3 日' } },
    { id: 'delayed', label: { 'en-US': 'GA Mar 10', 'zh-CN': 'GA 3 月 10 日' } },
    { id: 'blank', label: { 'en-US': 'Empty starter canvas', 'zh-CN': '起始空白画布' } },
    { id: 'media-missing', label: { 'en-US': 'Media not provided', 'zh-CN': '尚未提供媒体' } },
    { id: 'media-ready', label: { 'en-US': 'Local image ready', 'zh-CN': '本地图片就绪' } },
    { id: 'media-invalid', label: { 'en-US': 'Invalid file; content preserved', 'zh-CN': '文件无效，内容保留' } },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})

export default { metadata, files, Preview }
