import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Element discovery', 'zh-CN': '元素查找' },
  title: { 'en-US': 'Search and Element Query', 'zh-CN': '搜索与元素查询' },
  description: {
    'en-US': 'Query native canvas text or element types, deduplicate hits, and focus matching elements.',
    'zh-CN': '查询原生 Canvases 文字或元素类型，对命中结果去重并聚焦对应元素。',
  },
  tags: { 'en-US': ['Canvases', 'Single feature', 'Search'], 'zh-CN': ['Canvases', '单功能', '搜索'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.findElementsByText()',
    'FBoard.describeElements()',
    'FBoard.getElementsBoundingRectByIds()',
    'FBoard.focusElement()',
    'FBoard.getElementViewportPoint()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Four cards and two connectors demonstrate case-insensitive text, type filters, connector labels and duplicate hits. Search and the result list are the API integration; the canvas retains its native editing controls.',
      'zh-CN':
        '四张卡片和两条连接线展示不区分大小写的文字、类型过滤、连接线标签及重复命中。搜索与结果列表用于展示 API 集成；Canvases 保留原生编辑控件。',
    },
    tryIt: {
      'en-US': [
        'Search Risk in Shapes: three cards match.',
        'Switch to All types and search again: the Risk connector matches both its name and label but appears once in the result list.',
        'Search Approved in Connectors, or try lowercase risk, surrounding spaces, blank text and an unmatched term.',
        'List by type ignores text and returns four shapes, two connectors or all six elements.',
        'Click a result to select and focus it through the public Facade. After native edits, run Search or List by type again.',
      ],
      'zh-CN': [
        '在图形中搜索 Risk：匹配三张卡片。',
        '切换全部类型并搜索：Risk 连接线的名称和标签均命中，但结果列表只显示一次。',
        '在连接线中搜索 Approved；尝试小写 risk、首尾空格、空白文字及无匹配词。',
        '按类型列出忽略搜索文字，返回四个图形、两条连接线或全部六个元素。',
        '点击结果，通过公开 Facade 选中并聚焦元素。原生编辑后重新搜索或按类型列出。',
      ],
    },
    expected: {
      'en-US':
        'The SDK Find index performs text matching; describeElements supplies type filtering. Unique result IDs drive the public union-bounds and focus APIs. Blank or unmatched text has no hits and null bounds. No bulk-selection Facade is exposed in this SDK, so this example offers individual focus only. Complete English/Chinese SDK and host labels, official styles and the same exported factory are used. Theme changes preserve edits and query state. Native license notices remain.',
      'zh-CN':
        'SDK Find 索引执行文字匹配，describeElements 提供类型过滤。去重后的 ID 用于公开联合包围框与聚焦 API。空白或无匹配文字返回零命中和空包围框。此 SDK 未公开批量选择 Facade，因此示例仅提供单个结果聚焦。使用完整中英文 SDK 与宿主标签、官方样式及同一导出工厂。主题切换保留编辑与查询状态，原生授权提示保留。',
    },
  },
  variants: [
    ['text-shapes', 'Shape text', '图形文字'],
    ['text-all', 'All element text', '全部元素文字'],
    ['connector-labels', 'Connector labels', '连接线标签'],
    ['type-only', 'Type query', '类型查询'],
    ['case-insensitive', 'Case-insensitive search', '不区分大小写'],
    ['blank-query', 'Blank query', '空白查询'],
    ['deduplicated-results', 'Unique results', '结果去重'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['search', 'Search', '搜索'],
    ['type', 'List by type', '按类型列出'],
    ['focus-result', 'Focus result', '聚焦结果'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['matches', 'Matches', '有匹配'],
    ['no-matches', 'No matches', '无匹配'],
    ['focused', 'Focused result', '已聚焦'],
    ['error', 'Query error', '查询错误'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
