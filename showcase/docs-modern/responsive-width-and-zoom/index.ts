import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/docs-modern-responsive-width-and-zoom.png',
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Responsive Width and Zoom', 'zh-CN': '响应式宽度与缩放' },
  description: {
    'en-US':
      'Resize a mixed-content nursery memo, change its reading width and zoom, and track the actual SDK selection and layout.',
    'zh-CN': '调整苗圃混合内容备忘录的容器、阅读宽度与缩放，检查 SDK 实际选区和布局。',
  },
  tags: {
    'en-US': ['Modern Docs', 'Single feature', 'Responsive', 'Zoom'],
    'zh-CN': ['现代文档', '单功能', '响应式', '缩放'],
  },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'SetDocZoomRatioOperation',
    'RichTextEditingMutation',
    'FDocument.setSelection()',
    'DocBackScrollRenderController.scrollToRange()',
    'DocSelectionRenderService.getActiveTextRange()',
    'DocSkeletonManagerService',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Willow is a fictional nursery with 263 seedlings across three stations. Compare two shifts, a supplies table, a native chart and an original CC0 map. All content stays in the same document while the host changes size.',
      'zh-CN':
        'Willow 是虚构苗圃，三个站点共 263 株幼苗；文档包含双栏班次、物资表、原生图表和原创 CC0 地图。容器尺寸变化时保持同一文档。',
    },
    tryIt: {
      'en-US': [
        'Select the handover text, then switch between desktop, tablet and phone hosts.',
        'Compare focused, comfortable and wide reading widths.',
        'Use the native footer to set 150% zoom and compare the actual document layout.',
        'Edit the native document, resize, then use native Undo: layout operations must not consume text history.',
        'Try an empty or invalid native zoom input; widen the host or lower zoom after a narrow-layout failure.',
      ],
      'zh-CN': [
        '选中交接文本，切换桌面、平板与手机容器。',
        '比较专注、舒适与宽屏阅读宽度。',
        '使用原生页脚设置 150% 缩放，比较实际文档布局。',
        '在原生文档编辑后调整容器，再使用原生撤销；布局操作不得占用文字撤销历史。',
        '尝试空白或非法的原生缩放输入；窄屏布局失败后降低缩放或扩大容器。',
      ],
    },
    expected: {
      'en-US':
        'Preview and standalone use identical source, five official stylesheets and complete EN/ZH packs. Container integration measures the host and uses no-history SDK mutations; native footer zoom drives the same document model. The original columns, table, chart and map remain editable. Native text input and complete Undo/Redo pass. Strict beta.2 gaps remain: 390px at 150% can retain stale layout, a chart model shrunk to 506.67 can retain a 520-wide native frame, resize/history can change serialized drawing resources, and saved-owner reconstruction drops optional drawing transform fields. Full raw comparisons are not normalized and no SDK package is patched. Same-owner themes and pending/double disposal are verified. This capability remains partial.',
      'zh-CN':
        '预览与独立示例同源，包含五份官方样式和完整中英文依赖包。容器集成测量宽度并使用不进入历史的 SDK 修改；原生页脚缩放驱动同一文档模型。原创分栏、表格、图表和地图保持可编辑；原生文字输入及完整撤销/重做通过。beta.2 仍有严格缺口：390px / 150% 可保留旧布局，图表模型缩至 506.67 后原生图框仍为 520，重排/撤销会改变序列化绘图资源，同 ID 重建会丢失绘图变换的可选字段。完整模型比较不做归一化，未修改 SDK。已验证同实例主题及初始化中/重复销毁。此能力仍为部分完成。',
    },
  },
  variants: [
    ['fluid', 'Fluid host', '自适应容器'],
    ['desktop', 'Desktop · 960px', '桌面 · 960px'],
    ['tablet', 'Tablet · 600px', '平板 · 600px'],
    ['phone', 'Phone · 390px', '手机 · 390px'],
    ['compact', 'Compact · 320px', '紧凑 · 320px'],
    ['focused', 'Focused reading · 640', '专注阅读 · 640'],
    ['comfortable', 'Comfortable reading · 820', '舒适阅读 · 820'],
    ['wide', 'Wide reading · 1040', '宽屏阅读 · 1040'],
    ['50-percent', 'Native zoom · 50%', '原生缩放 · 50%'],
    ['100-percent', 'Native zoom · 100%', '原生缩放 · 100%'],
    ['150-percent', 'Native zoom · 150%', '原生缩放 · 150%'],
    ['200-percent', 'Native zoom · 200%', '原生缩放 · 200%'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [['host', 'Resize host', '调整容器'], ['reading', 'Apply reading width', '应用阅读宽度'], ['zoom', 'Native footer zoom', '原生页脚缩放']].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [['default', 'Original memo', '原创备忘录'], ['edited', 'Edited content', '已编辑内容'], ['error', 'SDK layout failure', 'SDK 布局失败']].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
