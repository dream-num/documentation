import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Charts in Documents', 'zh-CN': '文档中的图表' },
  description: {
    'en-US':
      'Create and update a native monthly chart inside a repair-hub review: data, chart variants, style, anchors and PNG export.',
    'zh-CN': '在维修中心月报中创建并更新原生图表：数据、图表变体、样式、锚点与 PNG 导出。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Charts'], 'zh-CN': ['现代文档', '单功能', '图表'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-chart',
    '@univerjs-pro/docs-chart-ui',
    '@univerjs-pro/engine-chart',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.newChart()',
    'FDocument.insertChart()',
    'FChart.setDataSource()',
    'FChart.setType()',
    'FChart.setValueFields()',
    'FChart.setTitle()',
    'FChart.setLegend()',
    'FChart.setPalette()',
    'FChart.setSize()',
    'UpdateDrawingDocTransformCommand',
    'DocChartSnapshotRenderService.exportImage()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Saffron is a fictional community repair hub. Its original Q1 dataset totals 162 repairs and 73 workshop participants. The two delivery plans, follow-up table and CC0 workshop sketch are independent references.',
      'zh-CN':
        'Saffron 是虚构的社区维修中心。原创第一季度数据合计 162 次维修、73 人次工作坊参与；双栏方案、跟进表与 CC0 工作室示意图是独立内容。',
    },
    tryIt: {
      'en-US': [
        'Update February repairs from 57 to 71: totals become 176 and 73; checksum becomes 249.',
        'Compare seven chart types and select one or both measures.',
        'Load the Q2 closure scenario, where May has a real zero.',
        'Change the title, legend, palette and size, then download the SDK-generated PNG.',
        'Insert a note before the chart, reload its snapshot and inspect the stable paragraph anchor.',
        'Try Undo/Redo, invalid values, deletion, empty state, Reset and narrow screens.',
      ],
      'zh-CN': [
        '将二月维修数从 57 改为 71：合计变为 176 和 73，校验和变为 249。',
        '比较七种图表，选择单一或两个指标。',
        '载入第二季度停工场景，五月包含真实零值。',
        '修改标题、图例、配色和尺寸，下载 SDK 生成的 PNG。',
        '在图表前插入说明，重载快照并检查稳定段落锚点。',
        '尝试撤销重做、非法输入、删除、空状态、重置与窄屏。',
      ],
    },
    expected: {
      'en-US':
        'Preview, displayed source and standalone download call the same implementation. Docs Chart and its UI plugin own data, rendering and frontend PNG export; no server or screenshot substitute is used. Resize defaults to the SDK drawing-size command; the Chart facade path is available for comparison. Known beta.2 gaps: the facade resize and Undo of drawing-size changes update model/skeleton dimensions but can leave the visible chart frame at its previous size. Strict frame tests remain failing; no SDK package is patched. Viewport reflow uses no-history layout mutations. Reload preserves the native chart and paragraph anchor. Theme changes restore the fixture; standalone defaults to light. This capability remains partial.',
      'zh-CN':
        '预览、展示源码与独立下载调用同一实现。Docs Chart 及其 UI 插件负责数据、渲染与前端 PNG 导出，无后端或截图替代。Resize 默认使用 SDK 绘图尺寸命令，并提供 Chart facade 路径作对比。已知 beta.2 问题：Facade 缩放及绘图尺寸撤销可更新模型和文档布局，但可见图表框仍保留先前大小；严格图框测试仍失败，未修改 SDK 包。窗口重排通过不进入撤销历史的布局修改实现。重载保留图表及段落锚点；主题切换恢复初始数据，独立示例默认浅色。此能力仍为部分完成。',
    },
  },
  variants: [
    'column',
    'line',
    'area',
    'bar',
    'columnStacked',
    'pie',
    'donut',
    'quarter',
    'corrected',
    'pause',
    'all',
    'repairs',
    'workshops',
    'copper',
    'violet',
    'drawing-size-command',
    'chart-facade-size',
  ].map((id) => ({ id, label: { 'en-US': id } })),
  actions: [
    'insert',
    'type',
    'data',
    'value',
    'series',
    'title',
    'legend',
    'palette',
    'size',
    'note',
    'show',
    'png',
    'delete',
    'undo',
    'redo',
    'inspect',
    'reload',
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
