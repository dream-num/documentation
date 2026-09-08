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
      'Present one field-research table as four independent native Grid views. Change field visibility, order, width, frozen columns, and row height without deleting fields or changing the other view.',
    'zh-CN':
      '以四个独立原生网格视图展示野外研究记录，调整字段显隐、顺序、宽度、冻结列和行高，不删除字段、不影响另一个视图。',
  },
  tags: {
    'en-US': ['Bases', 'Single feature', 'SDK projection'],
    'zh-CN': ['多维表格', '单功能', 'SDK 投影'],
  },
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
        'Present one field-research table as four independent native Grid views. Change field visibility, order, width, frozen columns, and row height without deleting fields or changing the other view.',
      'zh-CN':
        '以四个独立原生网格视图展示野外研究记录，调整字段显隐、顺序、宽度、冻结列和行高，不删除字段、不影响另一个视图。',
    },
    tryIt: {
      'en-US': [
        'Use the native view sidebar to switch Full record, Compact fieldwork, Notes-first review and Lab handover.',
        'Compare visible fields, column order, widths, row heights and frozen fields. All views share the same eight records.',
        'Use native column and view settings to customize one view; return to another and compare its independent layout.',
      ],
      'zh-CN': [
        '使用原生视图侧栏切换完整记录、紧凑采样、笔记优先和实验室交接。',
        '对照显隐字段、列顺序、列宽、行高和冻结字段，四个视图共用八条记录。',
        '通过原生列菜单和视图设置调整一个视图，再切换另一个对照其独立布局。',
      ],
    },
    expected: {
      'en-US':
        'Settings belong to the active view. The table field order and records remain unchanged. Hidden fields are not a security boundary: their values still exist in the Base.',
      'zh-CN': '设置归属当前视图，表字段顺序和记录不变。隐藏字段不是安全权限控制，其值仍保留在 Base 内。',
    },
  },
  variants: [
    { id: 'full', label: { 'en-US': 'Full record', 'zh-CN': '完整记录' } },
    { id: 'compact', label: { 'en-US': 'Compact fieldwork', 'zh-CN': '紧凑采样' } },
    { id: 'review', label: { 'en-US': 'Notes-first review', 'zh-CN': '笔记优先' } },
    { id: 'lab', label: { 'en-US': 'Lab handover', 'zh-CN': '实验室交接' } },
  ],
  actions: [],
  states: [
    { id: 'baseline', label: { 'en-US': 'Original fixture', 'zh-CN': '原始数据' } },
    { id: 'modified', label: { 'en-US': 'Modified projection', 'zh-CN': '已修改投影' } },
    { id: 'empty', label: { 'en-US': 'Empty values in records', 'zh-CN': '记录包含空值' } },
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './README.md',
})
export default { metadata, files, Preview }
