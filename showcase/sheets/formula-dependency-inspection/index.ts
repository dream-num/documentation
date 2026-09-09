import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Formula Dependency Inspection', 'zh-CN': '公式依赖关系检查' },
  description: {
    'en-US':
      'Inspect a cell dependency tree, consumers of an input range and formulas located inside a range using public asynchronous APIs.',
    'zh-CN': '使用公开异步API检查单元格依赖树、输入区域的依赖者与区域内部公式，比较同表及跨表计算链。',
  },
  tags: {
    'en-US': ['Dependencies', 'Formula inspection', 'Cross-sheet', 'Public API'],
    'zh-CN': ['依赖关系', '公式检查', '跨工作表', '公开API'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FFormula.getCellDependencyTree()' },
    { name: 'FFormula.getRangeDependents()' },
    { name: 'FFormula.getInRangeFormulas()' },
  ],
  variants: [
    { id: 'cell', label: { 'en-US': 'Cell dependency tree', 'zh-CN': '单元格依赖树' } },
    { id: 'consumers', label: { 'en-US': 'Consumers of a shared input', 'zh-CN': '共享输入的依赖者' } },
    { id: 'location', label: { 'en-US': 'Cross-sheet versus in-range formulas', 'zh-CN': '跨表与区域内公式' } },
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
