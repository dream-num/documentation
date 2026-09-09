import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  previewHeight: 900,
  group: { 'en-US': 'Records', 'zh-CN': '记录' },
  title: { 'en-US': 'Record Hierarchy', 'zh-CN': '父子记录层级' },
  description: {
    'en-US': 'Compare roots, children and grandchildren, move a subtree and reject a cyclic parent relationship.',
    'zh-CN': '对比根记录、子记录与孙记录，移动子树并拒绝循环父子关系。',
  },
  tags: { 'en-US': ['Hierarchy', 'Parent records'], 'zh-CN': ['层级', '父记录'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    { name: 'FBaseTable.getHierarchyFieldId()' },
    { name: 'FBaseTableRecord.setParent()' },
    { name: 'FBaseTableRecord.getChildren()' },
    { name: 'FBaseTableRecord.getAncestors()' },
  ],
  variants: [
    { id: 'tree', label: { 'en-US': 'Three-level hierarchy', 'zh-CN': '三级父子记录' } },
    { id: 'move', label: { 'en-US': 'Move a subtree', 'zh-CN': '移动整棵子树' } },
    { id: 'root', label: { 'en-US': 'Promote to root', 'zh-CN': '提升为根记录' } },
    { id: 'cycle', label: { 'en-US': 'Reject a cycle', 'zh-CN': '拒绝循环关系' } },
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
