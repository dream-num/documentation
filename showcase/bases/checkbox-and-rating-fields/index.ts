import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'bases' as const,
  category: 'features' as const,
  previewHeight: 800,
  group: { 'en-US': 'Field types', 'zh-CN': '字段类型' },
  title: { 'en-US': 'Checkbox and Rating Fields', 'zh-CN': '复选框与评分字段' },
  description: {
    'en-US':
      'Edit independent native checkboxes, five-star craft ratings and three-heart appeal ratings across six print reviews.',
    'zh-CN': '在六份版画评审中编辑独立原生复选框、五星工艺评分和三心喜爱评分。',
  },
  tags: { 'en-US': ['Checkbox', 'Rating', 'Field configuration'], 'zh-CN': ['复选框', '评分', '字段配置'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [{ name: 'FBaseTableRecord.setValue() / getValue()' }, { name: 'FBaseTableField.setConfig() / getConfig()' }],
  variants: [
    { id: 'checkbox', label: { 'en-US': 'Checked, unchecked and empty', 'zh-CN': '选中、未选中与空值' } },
    { id: 'rating', label: { 'en-US': 'Five stars and three hearts', 'zh-CN': '五星与三心' } },
    { id: 'zero', label: { 'en-US': 'Zero versus unrated storage', 'zh-CN': '零分与未评分存储' } },
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
