import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'bases' as const,
  image: '/assets/showcase/bases-attachment-fields.png',
  category: 'features' as const,
  group: { 'en-US': 'Fields', 'zh-CN': '字段' },
  title: { 'en-US': 'Attachment fields', 'zh-CN': '附件字段' },
  description: {
    'en-US': 'Inspect original image, text and mixed-file packets through native attachment fields.',
    'zh-CN': '通过原生附件字段查看原创图片、文本及混合文件资料。',
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui'],
  tags: { 'en-US': ['Attachments', 'Images', 'Files'], 'zh-CN': ['附件', '图片', '文件'] },
  apis: ['FBaseTableRecord.getValue()', 'FBaseTableRecord.setAttachments()'].map((name) => ({ name })),
  variants: [
    ['lamp', 'Single image', '单张图片'],
    ['chair', 'Multiple images', '多张图片'],
    ['radio', 'Text file', '文本文件'],
    ['pouch', 'Mixed files', '混合文件'],
    ['clock', 'Empty field', '空字段'],
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
