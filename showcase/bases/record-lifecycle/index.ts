import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Records and editing', 'zh-CN': '记录与编辑' },
  title: { 'en-US': 'Harbour Commons / Record Lifecycle', 'zh-CN': 'Harbour Commons / 记录生命周期' },
  description: {
    'en-US':
      'Explore a native three-table arts festival Relational Table, with twenty literal Facade variants for single and batch intake, named fields, ranges, order keys and stable identities.',
    'zh-CN':
      '以原生三表艺术节 Relational Table 展示记录能力，通过二十个可运行 Facade 变体说明单条与批量录入、命名字段、范围、顺序键和稳定标识。',
  },
  tags: { 'en-US': ['Records', 'Batch editing', 'Stable IDs'], 'zh-CN': ['记录', '批量编辑', '稳定标识'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    'FBaseTable.addRecord() / addRecords()',
    'FBaseTableRecord.setValue() / setValues()',
    'FBaseTable.getRange()',
    'FBaseTableRange.setValues()',
    'FBaseTableRecord.setOrderKey()',
    'FBaseTableRecord.duplicate() / delete()',
    'FBaseTable.deleteRecords()',
    'FBase.save()',
    'FUniver.undo() / redo()',
    'FUniver.disposeUnit() / createBase()',
    'FBaseUI.activateTable() / activateView()',
  ].map((name) => ({ name })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
