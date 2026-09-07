import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Headless and server', 'zh-CN': '无头与服务端' },
  packages: [
    '@univerjs/core',
    '@univerjs/docs',
    '@univerjs/engine-render',
    '@univerjs/engine-formula',
    '@univerjs/sheets',
    '@univerjs/sheets-formula',
    '@univerjs/sheets-numfmt',
  ],
  apis: [{ name: 'FUniver.newAPI() / createWorkbook()' }, { name: 'FWorkbook.save()' }, { name: 'Univer.dispose()' }],
  guide: {
    overview: {
      'en-US':
        'Run the Sheets model, formula and number-format plugins without browser UI. The terminal renders the exact JSON snapshot printed by the exported Node entry.',
      'zh-CN':
        '在没有浏览器 UI 的情况下运行 Sheets 模型、公式和数字格式插件。终端展示的就是导出 Node 入口打印的同一份 JSON 快照。',
    },
    tryIt: {
      'en-US': [
        'Inspect the Northstar two-sheet snapshot: text, decimals, zero, missing pH, negative variance and formulas are distinct values.',
        'Run the exported entry with Node 22+ type stripping; it creates the workbook through FUniver and serializes it through FWorkbook.save().',
        'Change the fixture and rerun to compare a deterministic serialized workbook without mounting browser UI.',
      ],
      'zh-CN': [
        '检查 Northstar 双工作表快照：文本、小数、零、缺失 pH、负方差与公式均为不同数据。',
        '使用 Node 22+ 的类型剥离运行导出入口；它通过 FUniver 创建工作簿，并通过 FWorkbook.save() 序列化。',
        '修改 fixture 后重新运行，在不挂载浏览器 UI 的情况下比较确定性工作簿快照。',
      ],
    },
    expected: {
      'en-US':
        'Preview and Node entry call the same headless factory and produce the same snapshot. There is intentionally no editor CSS, canvas, theme switch or host button because this is not a UI demo.',
      'zh-CN':
        'Preview 与 Node 入口调用同一无头工厂并生成相同快照。这里刻意没有编辑器 CSS、canvas、主题切换或宿主按钮，因为它不是 UI 案例。',
    },
  },
  variants: [
    {
      id: 'values',
      label: { 'en-US': 'Text / decimal / zero / missing / negative', 'zh-CN': '文本 / 小数 / 零 / 缺失 / 负数' },
    },
    { id: 'formulas', label: { 'en-US': 'SUM / AVERAGE formulas', 'zh-CN': 'SUM / AVERAGE 公式' } },
    { id: 'worksheets', label: { 'en-US': 'Samples / Run Notes worksheets', 'zh-CN': '样本 / 运行记录工作表' } },
  ],
  actions: [
    { id: 'create', label: { 'en-US': 'Create through FUniver', 'zh-CN': '通过 FUniver 创建' } },
    { id: 'save', label: { 'en-US': 'Serialize through FWorkbook', 'zh-CN': '通过 FWorkbook 序列化' } },
    { id: 'dispose', label: { 'en-US': 'Dispose owning Univer', 'zh-CN': '销毁 owning Univer' } },
  ],
  states: [
    { id: 'created', label: { 'en-US': 'Headless workbook created', 'zh-CN': '无头工作簿已创建' } },
    { id: 'serialized', label: { 'en-US': 'JSON snapshot serialized', 'zh-CN': 'JSON 快照已序列化' } },
  ],
  title: {
    'en-US': 'Running Headless Univer Sheets in Node.js',
    'zh-CN': '在 Node.js 运行无头 Univer Sheets',
    'zh-TW': '在 Node.js 運行無頭 Univer Sheets',
    'ja-JP': 'Node.js でヘッドレス Univer Sheets を実行する',
  },
  description: {
    'en-US': 'Create and serialize a varied two-sheet workbook with public Facades and no browser UI.',
    'zh-CN': '使用公开 Facade 在没有浏览器 UI 的情况下创建并序列化一个多样化双表工作簿。',
    'zh-TW': '使用公開 Facade，在沒有瀏覽器 UI 的情況下建立並序列化多樣化雙表活頁簿。',
    'ja-JP': '公開 Facade を使い、ブラウザー UI なしで多様な2シートのブックを作成・シリアライズします。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Plugin Mode', 'Node.js', 'Headless'],
    'zh-CN': ['Univer Sheets', '插件模式', 'Node.js', '无头'],
    'zh-TW': ['Univer Sheets', '外掛模式', 'Node.js', '無頭'],
    'ja-JP': ['Univer Sheets', 'プラグインモード', 'Node.js', 'ヘッドレス'],
  },
}

export const files = readShowcaseFiles(import.meta.url, {
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
  '/src/index.ts': './code/index.ts',
  '/src/data.ts': './code/data.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
})

export default { metadata, files, Preview }
