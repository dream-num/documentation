import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-checkbox-validation.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Data quality', 'zh-CN': '数据质量' },
  title: { 'en-US': 'Checkbox Data Validation', 'zh-CN': '复选框数据验证' },
  description: {
    'en-US':
      'Toggle native checkboxes with numeric or custom text values; inspect formula readback and validation rules.',
    'zh-CN': '原生复选框对比数字及自定义文本值，查看公式读回和验证规则。',
  },
  tags: { 'en-US': ['Checkbox', 'Validation', 'Custom values'], 'zh-CN': ['复选框', '数据验证', '自定义值'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-data-validation'],
  apis: [
    { name: 'FDataValidationBuilder.requireCheckbox()' },
    { name: 'FRange.setDataValidation() / setValues() / getValues()' },
    { name: 'FWorkbook.save()' },
  ],
  variants: [
    {
      id: 'numeric',
      label: { 'en-US': 'Default 1 / 0', 'zh-CN': '默认 1 / 0' },
      description: {
        'en-US': 'Native two-state checkbox with numeric values.',
        'zh-CN': '采用数字值的原生两态复选框。',
      },
    },
    {
      id: 'custom',
      label: { 'en-US': 'Packed / Open', 'zh-CN': '自定义文本' },
      description: {
        'en-US': 'The same widget stores meaningful custom text.',
        'zh-CN': '同一原生组件存储自定义文本。',
      },
    },
  ],
  actions: [],
  states: [],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
