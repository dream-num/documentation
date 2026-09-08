import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Field types', 'zh-CN': '字段类型' },
  title: { 'en-US': 'Select and Multi-select Options', 'zh-CN': '单选与多选选项' },
  description: {
    'en-US': 'Explore native priority and habitat choices in an original coastal observatory.',
    'zh-CN': '在原创海岸观测站中体验原生优先级单选与栖息地多选。',
  },
  tags: {
    'en-US': ['Relational Tables', 'Single select', 'Multi-select', 'Option identity'],
    'zh-CN': ['Relational Tables', '单选', '多选', '选项标识'],
  },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    'FUniver.createBase()',
    'FBaseTableField.getConfig()',
    'FBaseTableField.setConfig()',
    'FBaseTableRecord.setValue()',
    'FBaseTableRecord.getValue()',
    'FBase.save()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Sable combines 30 survey tasks, 12 coastal projects and 18 sample handovers. Priority stores one stable ID; Habitats stores an ID array. Native editors fill the preview without fixture controls or duplicate buttons. Four official stylesheets and five complete EN/ZH packs are shared with exported code.',
      'zh-CN':
        'Sable 包含30个调查任务、12个海岸项目和18个样本交接。Priority 保存单个稳定 ID，Habitats 保存 ID 数组。原生编辑器占满预览，不叠加 fixture 或重复按钮。四份官方样式与五组完整中英文包随代码导出。',
    },
    tryIt: {
      'en-US': [
        'Open native Priority and Habitats cell pickers; compare single and multiple choices.',
        'Use the native field editor to inspect option labels, colors and order.',
        'Run the fourteen README snippets to compare identity, appearance, selection and error variants.',
        'Switch theme without resetting edits; use the native sidebar to explore all three tables.',
      ],
      'zh-CN': [
        '打开原生 Priority 与 Habitats 单元格选择器，比较单选与多选。',
        '在原生字段编辑器中查看选项名称、颜色和顺序。',
        '运行 README 的14段代码，比较标识、外观、选择与错误变体。',
        '切换主题时保留编辑，通过原生侧栏查看三个表。',
      ],
    },
    expected: {
      'en-US':
        'Rename changes labels, not stored IDs. Color/order changes do not reorder records. Null and empty arrays clear their respective choice types. Raw unknown-ID acceptance and used-option deletion remain SDK defects, not validated-input examples. Save returns Relational Table JSON, not a binary Office export.',
      'zh-CN':
        '改名只改变标签，不改存储 ID；颜色与选项排序不重排记录。null 与空数组分别清空单选和多选。原始未知 ID 写入及已用选项删除仍有 SDK 缺陷，不代表输入校验。Save 返回 Relational Table JSON，不是 Office 二进制导出。',
    },
  },
  variants: [
    ['identity', 'Stable IDs and renamed labels', '稳定 ID 与标签改名'],
    ['appearance', 'Independent colors and option order', '独立颜色与选项顺序'],
    ['selection', 'Single / Multiple / Incremental / Clear', '单选 / 多选 / 增量 / 清空'],
    ['integrity', 'Unknown references and explicit repair', '未知引用与显式修复'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['native', 'Use native cell and field editors', '使用原生单元格和字段编辑器'],
    ['examples', 'Run literal Facade examples', '运行原样 Facade 示例'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Original coastal observations', '原创海岸观测'],
    ['empty', 'Blank single and multiple choices', '空单选与多选'],
    ['error', 'Native unknown-ID behavior', '原生未知 ID 行为'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/reference/preview-entry.ts.txt': './preview/index.ts',
})
export default { metadata, files, Preview }
