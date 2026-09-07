import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/embed-crm-quote-calculator.png',
  product: 'embed' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Host application patterns', 'zh-CN': '宿主应用模式' },
  title: { 'en-US': 'CRM Quote Calculator', 'zh-CN': 'CRM 报价计算器' },
  description: {
    'en-US':
      'Drive an embedded quote with host product, quantity, discount and currency inputs; keep calculated contract totals live without overwriting an unapplied draft.',
    'zh-CN': '通过宿主产品、数量、折扣与币种输入驱动嵌入式报价，实时显示合同金额，同时保留尚未应用的草稿。',
  },
  tags: { 'en-US': ['Embed', 'Sheets', 'Host integration'], 'zh-CN': ['嵌入', '表格', '宿主集成'] },
  packages: [
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/sheets',
    '@univerjs/engine-formula',
    '@univerjs/sheets-numfmt',
  ],
  apis: [
    { name: 'FUniver.createWorkbook()' },
    { name: 'FUniver.disposeUnit()' },
    { name: 'FRange.setValues()' },
    { name: 'FRange.getRawValue()' },
    { name: 'FRange.getRawValues()' },
    { name: 'FRange.getFormulas()' },
    { name: 'FUniver.addEvent()' },
    { name: 'FUniver.toggleDarkMode()' },
    { name: 'FRange.getDisplayValue()' },
    { name: 'FRange.setNumberFormat()' },
    { name: 'FRange.getNumberFormat()' },
    { name: 'FWorkbook.save()' },
    { name: 'FFormula.calculationStart()' },
    { name: 'FFormula.calculationResultApplied()' },
    { name: 'FFormula.calculationEnd()' },
  ],
  guide: {
    overview: {
      'en-US': 'A realistic CRM shell owns business context while Univer owns the editable calculation surface.',
      'zh-CN': '真实 CRM 外壳负责业务上下文，Univer 负责可编辑的计算区域。',
    },
    tryIt: {
      'en-US': [
        'Change product, quantity, monthly USD price and discount in the host form. Apply writes inputs only after validation; unchanged inputs disable Apply.',
        'Choose EUR or JPY, inspect the illustrative FX proposal, and Apply. E4/E8/E9 formulas convert USD inputs using G4; E11 adds them. Source prices remain USD.',
        'Edit seats, service hours or pricing directly in the native Grid workbench.',
        'Native edits update totals without overwriting an unapplied host draft. Read sheet into form explicitly discards that draft.',
        'Compare subscription E4 with first-year contract E11, which includes implementation services.',
        'Use the literal README examples for Enterprise pricing, zero billable items, native errors, JSON download and same-ID snapshot reconstruction. These do not add buttons to the workbench.',
      ],
      'zh-CN': [
        '修改宿主产品、数量、每月美元价格和折扣；应用前校验全部输入，未变化时禁用应用按钮。',
        '选择 EUR 或 JPY，检查演示汇率后应用。E4/E8/E9 公式通过 G4 换算美元输入，E11 汇总；源价格仍为美元。',
        '直接在原生 Grid 工作台中编辑席位、服务工时或价格。',
        '原生编辑更新金额但不覆盖尚未应用的宿主草稿；回读表格显式丢弃草稿。',
        '比较订阅小计 E4 与包含实施服务的首年合同总额 E11。',
        'README 的逐字代码展示企业版报价、零计费项目、原生错误、JSON 下载及同 ID 快照重建，不额外占用工作台按钮。',
      ],
    },
    expected: {
      'en-US':
        'The CRM displays E4/E11 via getDisplayValue() after calculationResultApplied, including native edits and real errors. No host arithmetic or cached totals. Currency formatting is applied by the host action, not by editing F4 alone. Reload retains content, not undo history; JSON is not XLSX. Preview/export share the factory, visible Grid ribbon and official CSS. Theme changes preserve the owner, workbook and draft. FX is illustrative, not live.',
      'zh-CN':
        'CRM 在 calculationResultApplied 后通过 getDisplayValue() 显示 E4/E11，包括原生编辑及真实错误。不重复计算或使用缓存金额。币种格式由宿主应用操作设置，单改 F4 不会自动改格式。重载保留内容但不保留历史，JSON 不是 XLSX。预览与导出共享工厂、可见 Grid 菜单及官方 CSS；切换主题保留实例、工作簿和草稿，汇率仅用于演示。',
    },
  },
  variants: [
    {
      id: 'business',
      label: { 'en-US': 'Business plan · 48 seats', 'zh-CN': '商业版 · 48 席位' },
      description: {
        'en-US':
          'Default USD quote includes two distinct implementation services; subscription and contract totals differ.',
        'zh-CN': '默认美元报价含两项不同的实施服务，订阅小计与合同总额不同。',
      },
    },
    {
      id: 'enterprise',
      label: { 'en-US': 'Enterprise plan · 72 seats', 'zh-CN': '企业版 · 72 席位' },
      description: {
        'en-US': 'A literal Facade example writes Enterprise pricing; currency and service inputs stay unchanged.',
        'zh-CN': '逐字 Facade 示例写入企业版定价，保留币种及服务输入。',
      },
    },
    {
      id: 'native-edit',
      label: { 'en-US': 'Custom quote · host and native edits', 'zh-CN': '自定义报价 · 宿主与原生编辑' },
      description: {
        'en-US':
          'Apply a host draft or edit blue cells. Totals follow SDK calculation; draft synchronization is explicit.',
        'zh-CN': '应用宿主草稿或编辑蓝色单元格，金额跟随 SDK 计算，草稿同步需显式操作。',
      },
    },
    {
      id: 'currency',
      label: { 'en-US': 'USD / EUR / JPY', 'zh-CN': '美元 / 欧元 / 日元' },
      description: {
        'en-US':
          'Illustrative editable FX multiplies all USD line items in sheet formulas; SDK number formats control rounding and currency symbols.',
        'zh-CN': '可编辑的演示汇率在表格公式中换算所有美元项目，SDK 数字格式决定显示舍入和币种符号。',
      },
    },
    {
      id: 'source-states',
      label: { 'en-US': 'Source states and snapshots', 'zh-CN': '源状态与快照' },
      description: {
        'en-US':
          'Literal examples cover zero billable items, 100% discount/JPY and real formula errors. Snapshot examples retain the full workbook.',
        'zh-CN': '逐字示例覆盖零计费项目、100% 折扣日元及真实公式错误，快照示例保留完整工作簿。',
      },
    },
  ],
  actions: [
    {
      id: 'apply',
      label: { 'en-US': 'Apply host inputs', 'zh-CN': '应用宿主输入' },
      description: {
        'en-US':
          'Validate product, integer seats, price, discount and FX before any write. setValues() updates A4:D4 and F4:G4; setNumberFormat() formats E4:E11. These are separate SDK commands, not an atomic undo group.',
        'zh-CN':
          '写入前校验产品、整数席位、价格、折扣及汇率。setValues() 写入 A4:D4 和 F4:G4，setNumberFormat() 格式化 E4:E11。这些是独立 SDK 命令，不是原子撤销组。',
      },
    },
    {
      id: 'sync',
      label: { 'en-US': 'Read sheet into form', 'zh-CN': '回读表格到表单' },
      description: {
        'en-US':
          'getRawValues() replaces the host draft with current cells without writing to the workbook. Disabled when already synchronized.',
        'zh-CN': 'getRawValues() 用当前单元格替换宿主草稿，不写工作簿；已同步时禁用。',
      },
    },
  ],
  states: [
    {
      id: 'default',
      label: { 'en-US': 'Default · commercial quote', 'zh-CN': '默认 · 商业报价' },
      description: {
        'en-US':
          '48 Business seats, 12% discount and two implementation line items. Pending calculation never displays a cached total.',
        'zh-CN': '48 个商业版席位、12% 折扣与两项实施服务，等待计算时不显示缓存金额。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Empty · zero billable items', 'zh-CN': '空 · 零计费项目' },
      description: {
        'en-US': 'Zero seats and service hours produce real zero totals while retaining the calculation template.',
        'zh-CN': '零席位及零服务工时产生真实零金额，保留计算模板。',
      },
    },
    {
      id: 'boundary',
      label: { 'en-US': 'Boundary · 100% discount / JPY', 'zh-CN': '边界 · 100% 折扣 / 日元' },
      description: {
        'en-US':
          '100,000 seats at USD 0.01 with a full subscription discount; services remain payable and JPY has no display decimals.',
        'zh-CN': '100,000 席位、0.01 美元单价与订阅全额折扣，服务仍需付费，日元显示无小数。',
      },
    },
    {
      id: 'error',
      label: { 'en-US': 'Error · nonnumeric quantity', 'zh-CN': '错误 · 非数字数量' },
      description: {
        'en-US':
          'A text value in B4 produces a real SDK formula error. Invalid host inputs are separately rejected without writing any cells.',
        'zh-CN': 'B4 文本值产生真实 SDK 公式错误；无效宿主输入则在写入任何单元格前拒绝。',
      },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
})

export default { metadata, files, Preview }
