import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/bases-create-base-and-tables.png',
  product: 'bases',
  category: 'features',
  group: { 'en-US': 'Schema and lifecycle', 'zh-CN': '结构与生命周期' },
  title: {
    'en-US': 'Lumen / Create a Relational Table and Tables',
    'zh-CN': 'Lumen / 创建 Relational Tables 与数据表',
  },
  description: {
    'en-US':
      'Explore 60 original theatre-renewal records in the native Relational Table. Compare new-table placement, typed checklists, independent copies and snapshot restoration.',
    'zh-CN': '在原生 Relational Table 中探索 60 条原创剧院改造记录，比较新表位置、类型化检查表、独立副本与快照恢复。',
  },
  tags: { 'en-US': ['Relational Tables', 'Schema', 'Lifecycle'], 'zh-CN': ['Relational Tables', '结构', '生命周期'] },
  packages: ['@univerjs-pro/bases', '@univerjs-pro/bases-ui', '@univerjs-pro/license'],
  apis: [
    'FUniver.createBase()',
    'FBase.insertTable()',
    'FBaseTable.setName()',
    'FBase.duplicateTable()',
    'FBase.deleteTable()',
    'FBase.save()',
    'FBaseUI.activateTable()',
    'FBaseUI.setPersonOptions()',
    'FUniver.undo() / redo()',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Lumen community theatre renewal links 12 renovation projects, 30 different work packages and 18 acceptance milestones. Explore real typed fields, local people and embedded text attachments through the native sidebar and Grid. There are no demo-only control or inspector panels.',
      'zh-CN':
        'Lumen 社区剧院改造关联 12 个项目、30 个不同工作包及 18 个验收里程碑。使用原生侧栏和 Grid 查看真实类型化字段、本地人员与内嵌文本附件，不增加 Demo 专用控制或检查面板。',
    },
    tryIt: {
      'en-US': [
        'Use the native sidebar to visit Renovation projects, Work packages and Acceptance milestones.',
        'Edit the first project title or budget directly in the Grid; compare native Undo and Redo.',
        'Run the 20 literal README snippets to compare insertion positions, schema-only and record-inclusive copies.',
        'Edit the copied checklist and verify that the original checklist and the original 60 records stay unchanged.',
        'Use the exported application recipe to reconstruct the whole owner, preserving saved content and selection.',
      ],
      'zh-CN': [
        '使用原生侧栏查看 Renovation projects、Work packages 和 Acceptance milestones。',
        '直接在 Grid 中修改首个项目名称或预算，比较原生撤销与重做。',
        '运行 README 的 20 段原样代码，比较插入位置、仅结构副本与带记录副本。',
        '修改副本检查项，确认原始检查表及最初的 60 条记录保持不变。',
        '使用导出代码中的重建示例恢复完整实例，保留保存的内容及选择状态。',
      ],
    },
    expected: {
      'en-US':
        'Source examples call real Facades. Display renames preserve formula identity; copies have independent tables/views; invalid names preserve data. Five complete EN/ZH packs and four official stylesheets accompany export. Theme changes preserve the current owner and edits. Native person-ID painting and existing-table reorder remain explicit gaps; this is partial acceptance.',
      'zh-CN':
        '示例调用真实 Facade。显示名变更保留公式标识，副本具有独立表及视图，非法名称不应破坏数据。导出包含五套完整中英文语言包及四份官方样式；主题切换保留当前实例和编辑。原生人员 ID 显示及已有表重排仍是明确缺口，目前为部分验收。',
    },
  },
  variants: [
    ['position', 'Start, after selection, or end', '首位、所选表之后或末尾'],
    ['identity', 'Display label and formula identity', '显示名与公式标识'],
    ['copy', 'Schema-only and populated copies', '仅结构与含记录副本'],
    ['snapshot', 'Current content and earlier checkpoint', '当前内容与先前检查点'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  actions: [
    ['navigate', 'Native table navigation', '原生数据表导航'],
    ['edit', 'Native typed-cell editing', '原生类型化单元格编辑'],
    ['recipes', 'Run the literal Facade recipes', '运行原样 Facade 示例'],
    ['reconstruct', 'Reconstruct from Relational Table JSON', '从 Relational Table JSON 重建'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
  states: [
    ['default', 'Three linked tables / 60 records', '三张关联表 / 60 条记录'],
    ['empty', 'One empty typed table', '一张空的类型化数据表'],
    ['boundary', 'Reversed order and budget boundaries', '倒序与预算边界'],
    ['error', 'Original content with invalid-name probes', '原始内容与非法名称验证'],
  ].map(([id, en, zh]) => ({ id, label: { 'en-US': en, 'zh-CN': zh } })),
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
