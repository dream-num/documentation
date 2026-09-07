import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Grid presentation', 'zh-CN': '网格呈现' },
  title: { 'en-US': 'View-local Field Layout', 'zh-CN': '独立视图字段布局' },
  description: {
    'en-US':
      'Present one field-research table as two independent Grid views. Change field visibility, order, width, frozen columns, and row height without deleting fields or changing the other view.',
    'zh-CN':
      '以两个独立网格视图展示野外研究记录，调整字段显隐、顺序、宽度、冻结列和行高，不删除字段、不影响另一个视图。',
  },
  tags: { 'en-US': ['Bases', 'Single feature', 'SDK projection'], 'zh-CN': ['多维表格', '单功能', 'SDK 投影'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTableView.setFieldVisible()' },
    { name: 'FBaseTableView.setFieldWidth()' },
    { name: 'FBaseTableView.moveField()' },
    { name: 'FBaseTableView.updateConfig()' },
    { name: 'FBaseUI.activateView()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Present one field-research table as two independent Grid views. Change field visibility, order, width, frozen columns, and row height without deleting fields or changing the other view.',
      'zh-CN':
        '以两个独立网格视图展示野外研究记录，调整字段显隐、顺序、宽度、冻结列和行高，不删除字段、不影响另一个视图。',
    },
    tryIt: {
      'en-US': [
        'Choose Notes-first review: notes move beside Sample and rows grow taller.',
        'Switch to Reference view and confirm its layout is unchanged.',
        'Return to Working view; its customized layout is preserved.',
        'Compare Compact fieldwork and Lab handover, then toggle notes or set a width between 80 and 640 px.',
        'Inspect both projections; Reset restores both views and all original cell values.',
      ],
      'zh-CN': [
        '选择笔记优先，将说明移动到 Sample 之后并增大行高。',
        '切换参考视图，确认布局未变。',
        '返回工作视图，确认自定义布局被保留。',
        '比较紧凑与实验室交接变体，切换说明字段或设置 80–640 像素列宽。',
        '回读两个视图，重置所有布局和初始数据。',
      ],
    },
    expected: {
      'en-US':
        'Settings belong to the active view. The table field order and records remain unchanged. Hidden fields are not a security boundary: their values still exist in the Base.',
      'zh-CN': '设置归属当前视图，表字段顺序和记录不变。隐藏字段不是安全权限控制，其值仍保留在 Base 内。',
    },
  },
  variants: [
    { id: 'full', label: { 'en-US': 'Full record' } },
    { id: 'compact', label: { 'en-US': 'Compact fieldwork' } },
    { id: 'review', label: { 'en-US': 'Notes-first review' } },
    { id: 'lab', label: { 'en-US': 'Lab handover' } },
  ],
  actions: [
    { id: 'inspect', label: { 'en-US': 'Inspect SDK projection' } },
    { id: 'reset', label: { 'en-US': 'Reset' } },
    { id: 'width', label: { 'en-US': 'Apply width' } },
    { id: 'toggle-notes', label: { 'en-US': 'Toggle field notes' } },
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
})
export default { metadata, files, Preview }
