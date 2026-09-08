import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  previewHeight: 1000,
  category: 'features' as const,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Lookup Formula Comparisons', 'zh-CN': '查找公式对比' },
  description: {
    'en-US': 'Compare exact, wildcard, leftward, approximate and last-match lookups on one editable product catalog.',
    'zh-CN': '在可编辑产品目录中比较精确、通配符、向左、近似与末项查找。',
  },
  tags: { 'en-US': ['XLOOKUP', 'XMATCH', 'INDEX', 'MATCH'], 'zh-CN': ['XLOOKUP', 'XMATCH', 'INDEX', 'MATCH'] },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue()' }, { name: 'FRange.getValue()' }],
  variants: [
    { id: 'exact', label: { 'en-US': 'Exact match and position', 'zh-CN': '精确匹配与位置' } },
    { id: 'missing', label: { 'en-US': 'Missing value fallback', 'zh-CN': '缺失值处理' } },
    { id: 'wildcard', label: { 'en-US': 'Wildcard and leftward lookup', 'zh-CN': '通配符与向左查找' } },
    { id: 'approximate', label: { 'en-US': 'Next smaller tier', 'zh-CN': '向下近似匹配' } },
    { id: 'last', label: { 'en-US': 'Last duplicate match', 'zh-CN': '末项重复匹配' } },
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
