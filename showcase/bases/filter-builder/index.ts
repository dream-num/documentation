import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-filter-builder.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Queries and views', 'zh-CN': '查询与视图' },
  title: { 'en-US': 'Typed Filters: AND, OR, and Blanks', 'zh-CN': '类型化筛选：AND、OR 与空值' },
  description: {
    'en-US':
      'Filter a ten-company partner pipeline using SDK view settings. Compare AND, OR, text matching, missing owners, and an empty result without deleting records.',
    'zh-CN': '使用 SDK 视图设置筛选十家合作伙伴，比较 AND、OR、文本匹配、负责人空值与无匹配结果，筛选不会删除记录。',
  },
  tags: { 'en-US': ['Bases', 'Single feature', 'SDK projection'], 'zh-CN': ['多维表格', '单功能', 'SDK 投影'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.setFilter()' },
    { name: 'FBaseTableView.getFilter()' },
    { name: 'FBaseTableView.getProjection()' },
    { name: 'FBaseTableRecord.setValue()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Filter a ten-company partner pipeline using SDK view settings. Compare AND, OR, text matching, missing owners, and an empty result without deleting records.',
      'zh-CN': '使用 SDK 视图设置筛选十家合作伙伴，比较 AND、OR、文本匹配、负责人空值与无匹配结果，筛选不会删除记录。',
    },
    tryIt: {
      'en-US': [
        'Open the native Filter toolbar and add typed conditions; edit and remove them directly.',
        'Run the README EMEA AND budget ≥ 100,000 example: Aster, Ember and Ion remain.',
        'Edit Fjord budget to 140,000 and observe it enter the filtered view; test native Undo/Redo.',
        'Compare OR, blanks, lowercase text matching and no matches using the twelve literal Facade examples.',
        'Save and really reconstruct edited content with the README lifecycle example; theme changes keep the owner.',
      ],
      'zh-CN': [
        '打开原生筛选工具栏，直接添加、编辑或删除类型化条件。',
        '运行 README 的 EMEA 且预算至少 100,000 示例，保留 Aster、Ember 和 Ion。',
        '更新 Fjord 预算为 140,000，观察其进入筛选结果。',
        '比较 APAC 或高预算、负责人空值及无匹配结果。',
        '十二段 Facade 示例涵盖阈值、空值、小写文本和无匹配；宿主输入验证不伪造 SDK 错误。',
        'README 提供已编辑快照的真实销毁重建；主题切换保留当前实例。',
      ],
    },
    expected: {
      'en-US':
        'Visible record IDs come from getProjection(); all ten source records remain. The Facade supports flat AND/OR; the native panel edits AND only. On this SDK, native editing of an OR/≥ configuration changes it to AND/is; the README records this strict failure. Preview and export share five complete EN/ZH packs and four official stylesheets; theme changes preserve edits.',
      'zh-CN':
        '可见记录 ID 来自 getProjection()，原表保留十条记录。Facade 支持平级 AND/OR，原生面板只编辑 AND；当前 SDK 编辑 OR/≥ 条件会改成 AND/等于，README 保留严格失败。预览和导出共用五组完整中英文包及四份官方样式；主题切换保留编辑。',
    },
  },
  variants: [
    { id: 'all', label: { 'en-US': 'All opportunities', 'zh-CN': '所有商机' } },
    { id: 'and', label: { 'en-US': 'EMEA AND budget ≥ 100,000', 'zh-CN': 'EMEA 且预算至少 100,000' } },
    { id: 'or', label: { 'en-US': 'APAC OR budget ≥ 200,000', 'zh-CN': 'APAC 或预算至少 200,000' } },
    { id: 'blank', label: { 'en-US': 'Owner is empty', 'zh-CN': '负责人为空' } },
    { id: 'contains', label: { 'en-US': 'Company contains labs', 'zh-CN': '公司名称包含 labs' } },
    { id: 'empty', label: { 'en-US': 'No matching opportunities', 'zh-CN': '无匹配商机' } },
  ],
  actions: [
    { id: 'native-filter', label: { 'en-US': 'Edit native filter conditions', 'zh-CN': '编辑原生筛选条件' } },
    { id: 'source-variants', label: { 'en-US': 'Run literal Facade variants', 'zh-CN': '运行 Facade 变体代码' } },
    { id: 'source-restore', label: { 'en-US': 'Reconstruct an edited snapshot', 'zh-CN': '重建已编辑快照' } },
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
