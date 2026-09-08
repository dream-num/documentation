import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'docs-modern',
  category: 'features',
  group: { 'en-US': 'Layout', 'zh-CN': '布局' },
  title: { 'en-US': 'Two-to-Five Column Layouts', 'zh-CN': '两到五栏布局' },
  description: {
    'en-US': 'Compare two to five equal columns and 2:1 or 1:2 widths in a native editable document.',
    'zh-CN': '在原生可编辑文档中比较两到五栏均分、2:1 与 1:2 宽度。',
  },
  tags: { 'en-US': ['Modern Docs', 'Single feature', 'Column groups'], 'zh-CN': ['现代文档', '单功能', '分栏'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs-pro/docs-column',
    '@univerjs-pro/docs-column-ui',
    '@univerjs-pro/license',
  ],
  apis: [
    'FDocument.insertColumnGroup()',
    'FDocument.getColumnGroups()',
    'FDocumentColumnGroup.setWidthRatios()',
    'FDocumentColumnGroup.addColumn()',
    'FDocumentColumnGroup.deleteColumn()',
    'FDocumentColumnGroup.remove()',
    'FDocumentColumn.setText()',
    'FDocumentColumn.appendParagraph()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Six native column groups compare equal two-, three-, four- and five-column layouts with two asymmetric layouts. Each column contains a short editable text sample.',
      'zh-CN': '六个原生分栏组展示两、三、四、五栏均分，以及两个非对称布局。每栏均包含简短可编辑文字。',
    },
    tryIt: {
      'en-US': [
        'Compare the six layouts directly in the document.',
        'Click column text to type, then use native Undo/Redo.',
        'Use the native Grid Insert tab and column controls to insert or adjust columns.',
        'Use the exported README recipes to change ratios, add a column or append text through public Facades.',
      ],
      'zh-CN': [
        '直接在文档中比较六种布局。',
        '点击栏内文字进行输入，使用原生撤销与重做。',
        '通过原生 Grid 插入页签与分栏控件插入或调整栏目。',
        '参照导出的 README，通过公开 Facade 修改比例、增加栏目或追加文字。',
      ],
    },
    expected: {
      'en-US':
        'Preview and exported source share one factory, official styles and complete English/Chinese locale bundles. Native columns contain real editable document text. Theme changes preserve the document and edits. Native license notices remain. The README retains the earlier mixed-child image visibility and orphan-resource defects; this text-only gallery does not claim to fix or validate those cases.',
      'zh-CN':
        '预览与导出源码共用工厂、官方样式和完整中英文语言包。原生栏目包含真实可编辑文档文字。主题切换保留文档与编辑，原生授权提示保留。README 记录此前混合子内容的图片可见性及孤立资源缺陷；纯文字示例不宣称修复或验证这些场景。',
    },
  },
  variants: ['two-columns', 'three-columns', 'four-columns', 'five-columns', 'wide-left-2-1', 'wide-right-1-2'].map(
    (id) => ({ id, label: { 'en-US': id } }),
  ),
  actions: ['native-insert', 'native-edit-text', 'native-resize-columns', 'native-delete', 'native-undo-redo'].map(
    (id) => ({ id, label: { 'en-US': id } }),
  ),
  states: ['default', 'edited', 'error'].map((id) => ({ id, label: { 'en-US': id } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
