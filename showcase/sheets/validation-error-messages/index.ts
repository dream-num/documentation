import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  image: '/assets/showcase/sheets-validation-error-messages.png',
  category: 'features' as const,
  group: { 'en-US': 'Data validation', 'zh-CN': '数据校验' },
  title: { 'en-US': 'Validation Error Messages', 'zh-CN': '校验错误提示' },
  description: {
    'en-US': 'Compare native rejection, permissive invalid values and custom versus generated messages.',
    'zh-CN': '对比原生拒绝输入、保留无效值、自定义与自动生成的校验提示。',
  },
  tags: { 'en-US': ['Validation', 'Error message', 'Reject input'], 'zh-CN': ['校验', '错误提示', '拒绝输入'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-data-validation'],
  apis: [
    { name: 'FDataValidationBuilder.setAllowInvalid()' },
    { name: 'FDataValidationBuilder.setOptions()' },
    { name: 'FRange.getValidatorStatus()' },
  ],
  variants: [
    { id: 'reject', label: { 'en-US': 'Reject invalid', 'zh-CN': '拒绝无效值' } },
    { id: 'warning', label: { 'en-US': 'Keep with custom message', 'zh-CN': '保留并自定义提示' } },
    { id: 'default', label: { 'en-US': 'Generated message', 'zh-CN': '自动生成提示' } },
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
