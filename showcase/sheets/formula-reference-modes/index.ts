import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  image: '/assets/showcase/sheets-formula-reference-modes.png',
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Formula reference modes', 'zh-CN': '公式引用方式' },
  description: {
    'en-US': 'Compare relative, absolute and mixed references through native fill and recalculation.',
    'zh-CN': '通过原生填充与重算，对比相对、绝对及混合引用。',
  },
  packages: ['@univerjs/preset-sheets-core'],
  tags: { 'en-US': ['Formulas', 'References', 'Fill'], 'zh-CN': ['公式', '引用', '填充'] },
  apis: ['FRange.setFormula()', 'FRange.autoFill()', 'FRange.getFormulas()', 'FRange.setValues()'].map((name) => ({
    name,
  })),
  variants: [
    ['relative', 'Relative rows', '相对行引用'],
    ['absolute', 'Fixed anchor', '绝对引用'],
    ['mixed', 'Mixed matrix', '混合引用'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
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
