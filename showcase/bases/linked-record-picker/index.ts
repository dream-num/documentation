import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  image: '/assets/showcase/bases-linked-record-picker.png',
  group: { 'en-US': 'Fields and records', 'zh-CN': '字段与记录' },
  title: { 'en-US': 'Linked Record Picker', 'zh-CN': '关联记录选择器' },
  description: {
    'en-US':
      'Compare single and multiple record links, picker context and live target labels across two small equipment tables.',
    'zh-CN': '通过两张设备表比较单选、多选关联、选择器上下文及目标名称更新。',
  },
  tags: { 'en-US': ['Record links', 'Multiple tables', 'Picker'], 'zh-CN': ['关联记录', '多表', '选择器'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui'],
  apis: [
    { name: 'FBaseTableRecord.getLinkedRecordIds() / setLinkedRecordIds()' },
    { name: 'FBaseTableRecord.removeLinkedRecord() / setValue()' },
    { name: 'FBase.save()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two native Relational Tables distinguish single and multiple links, stable record IDs and contextual picker labels.',
      'zh-CN': '通过两张原生 Relational Table 表展示单选、多选关联、稳定记录 ID 和选择器上下文。',
    },
    tryIt: {
      'en-US': [
        'Select a Primary equipment cell and press F2 to compare the two Field recorder options.',
        'Open Additional equipment with F2, select several records and uncheck one.',
        'Rename the first recorder in Equipment and return to Requests to inspect the linked label.',
        'Run the five README recipes; native Delete clearing remains an explicitly unaccepted path.',
      ],
      'zh-CN': [
        '选中 Primary equipment 单元格并按 F2，比较两条 Field recorder 记录的上下文。',
        '使用 F2 打开 Additional equipment，选择多条记录后取消其中一条。',
        '在 Equipment 中修改第一条录音设备的名称，再返回 Requests 查看关联标签。',
        '运行 README 的五段代码；原生 Delete 清空操作仍未通过验收。',
      ],
    },
    expected: {
      'en-US':
        'Selection stores target IDs, not display labels. Renaming a target updates its linked label. Facade clearing is separate from the native clear limitation documented in README.',
      'zh-CN':
        '关联存储目标 ID 而非显示文本，目标改名会更新关联标签。Facade 清空与 README 中说明的原生清空限制分开验收。',
    },
  },
  variants: [
    { id: 'single', label: { 'en-US': 'Single target', 'zh-CN': '单条关联' } },
    { id: 'multiple', label: { 'en-US': 'Ordered multiple targets', 'zh-CN': '有序多条关联' } },
    { id: 'context', label: { 'en-US': 'Same label, different context', 'zh-CN': '同名记录与选择上下文' } },
    { id: 'empty', label: { 'en-US': 'Empty links and renamed targets', 'zh-CN': '空关联与目标改名' } },
  ],
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
