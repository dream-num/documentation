import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  previewHeight: 1000,
  group: { 'en-US': 'Formulas', 'zh-CN': '公式' },
  title: { 'en-US': 'Matrix Calculation Formulas', 'zh-CN': '矩阵计算公式' },
  description: {
    'en-US':
      'Multiply production matrices, transpose data, solve a linear system and compare singular or incompatible matrix errors.',
    'zh-CN': '计算生产矩阵乘积、转置数据、求解线性方程，比较奇异与维度不兼容矩阵的原生错误。',
  },
  tags: {
    'en-US': ['MMULT', 'TRANSPOSE', 'MINVERSE', 'MDETERM', 'MUNIT'],
    'zh-CN': ['MMULT', 'TRANSPOSE', 'MINVERSE', 'MDETERM', 'MUNIT'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [{ name: 'FRange.setValue() / setFormula() / getValues()' }],
  variants: [
    { id: 'product', label: { 'en-US': 'Rectangular matrix product', 'zh-CN': '矩形矩阵乘积' } },
    { id: 'inverse', label: { 'en-US': 'Inverse, solution and identity', 'zh-CN': '逆矩阵、解与单位矩阵' } },
    { id: 'errors', label: { 'en-US': 'Singular and dimension errors', 'zh-CN': '奇异与维度错误' } },
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
