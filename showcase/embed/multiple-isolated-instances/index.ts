import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

function option(id: string, en: string, zh: string, enDetail: string, zhDetail: string) {
  return { id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': enDetail, 'zh-CN': zhDetail } }
}
const metadata = {
  image: '/assets/showcase/embed-multiple-isolated-instances.png',
  product: 'embed' as const,
  category: 'features' as const,
  group: { 'en-US': 'Lifecycle', 'zh-CN': '生命周期' },
  title: { 'en-US': 'Multiple Isolated Instances', 'zh-CN': '多个独立实例' },
  description: {
    'en-US':
      'Edit two regional maintenance budgets in isolated iframe documents with independent data, themes and lifecycles.',
    'zh-CN': '在独立 iframe 中编辑两份区域维护预算，分别管理数据、主题与生命周期。',
  },
  tags: { 'en-US': ['Embed', 'Isolation', 'Lifecycle'], 'zh-CN': ['嵌入', '隔离', '生命周期'] },
  packages: [
    '@univerjs/core',
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/sheets',
    '@univerjs/engine-formula',
  ],
  apis: [
    { name: 'FUniver.createWorkbook()' },
    { name: 'FUniver.addEvent()' },
    { name: 'FWorkbook.getSheetBySheetId()' },
    { name: 'FRange.setValue() / activate() / getRawValue() / getDisplayValue()' },
    { name: 'FFormula.onCalculationResultApplied() / stopCalculation()' },
    { name: 'FWorkbook.save()' },
    { name: 'Univer.dispose() (core owner cleanup)' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two trusted same-origin iframe documents host separate SDK owners. North is light; South is dark. Unlike multiple workbooks in one SDK, these editors do not share theme documents or formula-engine instances.',
      'zh-CN':
        '两个受信任的同源 iframe 分别拥有 SDK 实例，北区为浅色，南区为深色。不同于一个 SDK 中的多本工作簿，它们不共享主题文档或公式引擎实例。',
    },
    tryIt: {
      'en-US': [
        'Change North air-filter price and inspect its calculated total; South must stay unchanged.',
        'Edit South tap-kit price natively; North must retain its edits.',
        'Release North, edit South natively and Undo, then Mount North again.',
        'Use the README source variants for empty/boundary budgets and guarded price validation.',
        'Download each full JSON snapshot and inspect its distinct workbook ID.',
      ],
      'zh-CN': [
        '修改北区滤芯价格并查看公式总额，南区应保持不变。',
        '原生编辑南区水龙头套件价格，北区应保留编辑。',
        '释放北区，在南区原生编辑并撤销，再重新挂载北区。',
        '使用 README 源码变体检查空/边界预算和价格输入校验。',
        '下载各自完整 JSON，查看不同工作簿 ID。',
      ],
    },
    expected: {
      'en-US':
        'Actual SDK values, native visuals and downloaded snapshots agree. Release and Mount affect only the selected region. The light editor keeps a white background beside the dark editor.',
      'zh-CN': '真实 SDK 值、原生画面与下载快照一致。释放和挂载只影响选中区域，浅色编辑器在深色编辑器旁保持白底。',
    },
  },
  variants: [
    option(
      'themes',
      'Independent themes',
      '独立主题',
      'Light North and dark South use separate iframe documents with official CSS.',
      '浅色北区和深色南区在独立 iframe 中加载官方 CSS。',
    ),
    option(
      'data',
      'Independent budgets',
      '独立预算',
      'Six different maintenance items in each region, with native formulas.',
      '每个区域六种不同维护项目，使用原生公式。',
    ),
    option(
      'reset',
      'Region-only remount',
      '单区域重挂载',
      'Release and mount one default budget without remounting the other owner.',
      '释放并挂载一侧默认预算，不重新挂载另一侧。',
    ),
    option(
      'release',
      'Selective disposal',
      '选择性释放',
      'Dispose one core owner while the other stays editable.',
      '销毁一个核心实例，另一个仍可编辑。',
    ),
  ],
  actions: [
    option('dispose', 'Release', '释放', 'Dispose only this region’s core owner.', '只释放当前区域的核心实例。'),
    option(
      'mount',
      'Mount',
      '挂载',
      'Create this region again; discarded edits are not restored.',
      '重新创建当前区域，不恢复已丢弃的编辑。',
    ),
    option(
      'download',
      'Download JSON',
      '下载 JSON',
      'Download the complete native workbook snapshot.',
      '下载完整原生工作簿快照。',
    ),
  ],
  states: [
    option(
      'default',
      'Default',
      '默认',
      'Distinct workshop and garden budgets with decimal prices.',
      '工坊和花园使用不同项目及小数价格。',
    ),
    option(
      'empty',
      'Empty',
      '空',
      'A real empty template with a zero SUM total; the README price recipe rejects the missing air-filter row.',
      '真实空模板，SUM 总额为零；README 价格代码拒绝缺失的滤芯目标行。',
    ),
    option(
      'boundary',
      'Boundary',
      '边界',
      'The first two prices become 0 and 100000 in the selected region.',
      '当前区域前两项价格分别为 0 和 100000。',
    ),
    option(
      'error',
      'Invalid host input',
      '无效宿主输入',
      'The README guarded-price recipe rejects -1 before writing; native editing is not restricted by that host recipe.',
      'README 价格校验代码在写入前拒绝 -1；原生编辑不受该宿主示例限制。',
    ),
    option(
      'saved-recovery',
      'Same-ID saved recovery',
      '同 ID 保存恢复',
      'The README recovery recipe recreates one owner from its complete saved model; Mount still creates authored defaults.',
      'README 恢复代码使用完整快照重建单侧实例；挂载仍创建原始默认数据。',
    ),
  ],
}
const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/region.ts': './code/region.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})
export default { metadata, files, Preview }
