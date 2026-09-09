import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  previewHeight: 800,
  group: { 'en-US': 'Field types', 'zh-CN': '字段类型' },
  title: { 'en-US': 'Contact and Link Fields', 'zh-CN': '联系方式与链接字段' },
  description: {
    'en-US':
      'Edit native labeled links, bare URLs, email and phone fields in a fictional studio directory with missing contact details.',
    'zh-CN': '在虚构工作室名录中编辑原生带标签链接、网址、邮箱和电话字段，并比较缺失的联系方式。',
  },
  tags: { 'en-US': ['Link', 'Email', 'Phone', 'Empty values'], 'zh-CN': ['链接', '邮箱', '电话', '空值'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [{ name: 'FBaseTableRecord.setValue() / getValue()' }],
  variants: [
    { id: 'link', label: { 'en-US': 'Labeled link and bare URL', 'zh-CN': '带标签链接与网址' } },
    { id: 'contact', label: { 'en-US': 'Native email and phone editors', 'zh-CN': '原生邮箱与电话编辑器' } },
    { id: 'empty', label: { 'en-US': 'Partial and empty contacts', 'zh-CN': '部分填写与空联系方式' } },
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
