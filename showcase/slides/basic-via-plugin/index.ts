import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/slides-basic-via-plugin.png',
  product: 'slides' as const,
  category: 'features' as const,
  group: { 'en-US': 'Presentation lifecycle', 'zh-CN': '演示文稿生命周期' },
  title: { 'en-US': 'Create and Extend a Presentation', 'zh-CN': '创建并扩展演示文稿' },
  description: {
    'en-US':
      'A native three-page plugin introduction, editable geometry and Q3 signals, with explicit summary append and same-ID persistence recipes.',
    'zh-CN': '原生三页插件入门、可编辑几何图形与 Q3 指标，并提供明确的总结追加与同 ID 持久化示例。',
  },
  tags: { 'en-US': ['Slides', 'Facade', 'Create'], 'zh-CN': ['幻灯片', 'Facade', '创建'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/shape-editor-ui'],
  apis: [
    { name: 'FUniver.createPresentation / disposeUnit / toggleDarkMode' },
    { name: 'FPresentation.appendSlide / deleteSlide / setActiveSlide / save' },
    { name: 'FSlide.getData / getElementById / setSpeakerNotes' },
    { name: 'FShape.getText().setText / setHorizontalAlign / setVerticalAlign; FShape.setTransform' },
  ],
  guide: {
    overview: {
      'en-US':
        'The original SDK cover, plugin registration shapes and Q3 product momentum are now three native pages. +31%, 94% and 7 remain independent authored signals, not Formula or Chart outputs.',
      'zh-CN':
        '原创 SDK 封面、插件注册图形与 Q3 产品动量成为三张原生页面。+31%、94% 和 7 保留为独立创作指标，并非公式或图表计算输出。',
    },
    tryIt: {
      'en-US': [
        'Edit real text and shapes with native Grid and thumbnails.',
        'Resize or rotate the ellipse and hexagon; save native Speaker notes.',
        'Run all 14 README blocks, including revised summary append and duplicate-request rejection.',
        'Compare full saved state after same-ID reconstruction, an empty deck and restore.',
      ],
      'zh-CN': [
        '通过原生 Grid 和缩略图编辑真实文本与图形。',
        '调整椭圆和六边形的尺寸或旋转，并保存原生演讲者备注。',
        '运行 README 的 14 段代码，包括追加修改版总结与重复请求拒绝。',
        '对照同 ID 重建、空白演示文稿及恢复后的完整保存状态。',
      ],
    },
    expected: {
      'en-US':
        'No duplicate host controls or hidden summary flag. Initial EN/ZH and five official CSS imports match export. Theme preserves the current edited owner; unsupported history or restore differences remain explicit failures.',
      'zh-CN':
        '无重复宿主控件或隐藏总结标志。初始中英文及五份官方 CSS 与导出一致；主题保留当前编辑实例，不隐藏历史或恢复差异。',
    },
  },
  variants: [
    ['cover', 'Original SDK cover', '原创 SDK 封面'],
    ['feature', 'Plugin text and native geometry', '插件文字与原生几何'],
    ['summary', 'Independent Q3 signals', '独立 Q3 指标'],
    ['copy', 'Revised summary copy', '修改版总结副本'],
    ['persistence', 'Same-ID save, empty and restore', '同 ID 保存、空白与恢复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native', 'Edit and navigate natively', '原生编辑与导航'],
    ['literal', 'Run 14 Facade recipes', '运行 14 段 Facade 示例'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['initial', 'Three authored pages', '三张原创页面'],
    ['extended', 'Independent summary copy', '独立总结副本'],
    ['invalid', 'Duplicate request rejected', '拒绝重复请求'],
    ['empty', 'Empty document with stable identity', '保留 ID 的空白文稿'],
    ['restored', 'Full saved state restored', '恢复完整保存状态'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
