import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Charts in Documents', 'zh-CN': '文档中的图表' },
  description: {
    'en-US': 'Seven inline chart examples with distinct data, legends and palettes, using the native document editor.',
    'zh-CN': '在原生文档编辑器中对照七种内联图表，各自展示不同数据、图例与配色。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Charts'], 'zh-CN': ['现代文档', '单功能', '图表'] },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.newChart()',
    'FDocument.insertChart()',
    'FDocument.getCharts()',
    'Chart builder: setSource() / setPosition() / setInline() / setSize() / setTitle() / setLegend() / setPalette()',
    'FUniver.toggleDarkMode()',
  ].map((name) => ({ name })),
  variants: [
    ['column', 'Column', '柱形'],
    ['line', 'Line', '折线'],
    ['area', 'Area', '面积'],
    ['bar', 'Bar', '条形'],
    ['stacked', 'Stacked column', '堆积柱形'],
    ['pie', 'Pie', '饼图'],
    ['donut', 'Donut', '环形'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [],
  states: [
    { id: 'gallery', label: { 'en-US': 'Native inline charts', 'zh-CN': '原生内联图表' } },
    { id: 'error', label: { 'en-US': 'SDK variant error disclosed in document', 'zh-CN': '文档中显示 SDK 变体错误' } },
  ],
  guide: {
    overview: {
      'en-US':
        'A focused visual gallery, not a business dashboard. Seven small original datasets demonstrate comparison, trend, volume, ranking, stacked totals and proportions. Legends vary between hidden, bottom and right, with cool and warm palettes.',
      'zh-CN':
        '聚焦视觉效果的图表对照，不是业务看板。七组简洁原创数据展示对比、趋势、数量、排名、堆积总量及占比。图例分别采用隐藏、底部及右侧布局，配合冷暖配色。',
    },
    tryIt: {
      'en-US': [
        'Scroll through the seven chart sections.',
        'Select a chart to inspect its native editing menu; no extra host control panel is added.',
        'Edit surrounding text using the Grid Ribbon. Changing the site theme retains document edits.',
      ],
      'zh-CN': [
        '滚动查看七个图表章节。',
        '选中图表查看原生编辑菜单，没有额外宿主控制面板。',
        '通过 Grid Ribbon 编辑周围文字，切换网站主题会保留文档编辑。',
      ],
    },
    expected: {
      'en-US':
        'The same factory powers preview and exported code with official Docs/Drawing/Chart CSS and complete EN/ZH locale packs. Unsupported variants disclose the SDK error inside their section and fail strict gallery acceptance. Known beta.2 facade-resize and drawing-size Undo frame defects are not fixed by this cleanup. Coverage remains partial; no trial restriction is hidden.',
      'zh-CN':
        '预览和导出源码使用相同工厂，包含官方 Docs/Drawing/Chart CSS 与完整中英文语言包。不支持的变体会在对应章节显示 SDK 错误，严格图库验收会失败。此清理没有修复 beta.2 Facade 缩放及绘图尺寸撤销后可见图框不同步的问题。当前仍为部分覆盖，不隐藏试用限制。',
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
