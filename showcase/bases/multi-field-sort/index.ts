import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-multi-field-sort.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Queries and views', 'zh-CN': '查询与视图' },
  title: { 'en-US': 'Multi-field Sort and Stable Ties', 'zh-CN': '多字段排序与相同值顺序' },
  description: {
    'en-US':
      'Order a calibration queue by number, text, and date fields. Explicit zero, negative, null, and tied values make the comparison visible.',
    'zh-CN': '按数值、文本和日期字段排列校准队列，使用零、负数、空值及相同值观察排序。',
  },
  tags: { 'en-US': ['Bases', 'Single feature', 'SDK projection'], 'zh-CN': ['多维表格', '单功能', 'SDK 投影'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.setSort()' },
    { name: 'FBaseTableView.getSort()' },
    { name: 'FBaseTableView.getProjection()' },
    { name: 'FBaseTableRecord.setValue()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Order a calibration queue by number, text, and date fields. Explicit zero, negative, null, and tied values make the comparison visible.',
      'zh-CN': '按数值、文本和日期字段排列校准队列，使用零、负数、空值及相同值观察排序。',
    },
    tryIt: {
      'en-US': [
        'Open native Sort, choose readiness descending, and compare 95-point ties.',
        'Compare Zone ↑ then score ↓ with Date ↑ then score ↓.',
        'Check Beacon/Cobalt and Flux/Indigo: ties retain their existing record order.',
        'Raise Meridian to 98 to reproduce the beta.2 issue: the value updates but the record retains its old position.',
        'Clear native sort conditions; run the ten README Facade examples and real edited-snapshot reconstruction.',
      ],
      'zh-CN': [
        '打开原生排序，选择分数降序并比较 95 分的同值记录。',
        '比较分区优先与日期优先的多字段排序。',
        '观察 Beacon/Cobalt 与 Flux/Indigo 的相同值记录顺序。',
        '将 Meridian 提升至 98 分，复现 beta.2 的问题：值已更新，位置仍未重排。',
        '清除原生排序条件；运行 README 十段 Facade 示例和已编辑快照的真实重建。',
      ],
    },
    expected: {
      'en-US':
        'Changing sort criteria changes projection order while source record order remains intact. Known beta.2 limitation: editing an existing sort key does not reliably reposition the record. Live re-sorting remains incomplete; this demo does not replace the SDK result with a host-side sort. Null values remain null in the readback even where the numeric renderer displays 0.00.',
      'zh-CN':
        '切换排序条件改变投影顺序，原表记录顺序不变。beta.2 已知限制：编辑排序字段后记录未可靠重排，实时重排仍未完成；本例不会用前端排序替换 SDK 结果。回读中的 null 仍为空值，即使数值渲染器将其显示为 0.00。',
    },
  },
  variants: [
    { id: 'original', label: { 'en-US': 'Original order', 'zh-CN': '原始顺序' } },
    { id: 'score-desc', label: { 'en-US': 'Score · highest first', 'zh-CN': '分数从高到低' } },
    { id: 'score-asc', label: { 'en-US': 'Score · lowest first', 'zh-CN': '分数从低到高' } },
    { id: 'zone-score', label: { 'en-US': 'Zone ↑ then score ↓', 'zh-CN': '分区升序再分数降序' } },
    { id: 'date-score', label: { 'en-US': 'Date ↑ then score ↓', 'zh-CN': '日期升序再分数降序' } },
    { id: 'name-desc', label: { 'en-US': 'Instrument · Z to A', 'zh-CN': '设备名称倒序' } },
  ],
  actions: [
    { id: 'native-sort', label: { 'en-US': 'Edit native sort criteria', 'zh-CN': '编辑原生排序条件' } },
    { id: 'source-variants', label: { 'en-US': 'Run literal Facade variants', 'zh-CN': '运行 Facade 变体' } },
    { id: 'source-restore', label: { 'en-US': 'Reconstruct edited content', 'zh-CN': '重建已编辑内容' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': 'Original fixture', 'zh-CN': '原始数据' } },
    { id: 'modified', label: { 'en-US': 'Modified projection', 'zh-CN': '已修改投影' } },
    { id: 'empty', label: { 'en-US': 'Empty values in records', 'zh-CN': '记录包含空值' } },
    { id: 'error', label: { 'en-US': 'Visible operation error', 'zh-CN': '可见操作错误' } },
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
