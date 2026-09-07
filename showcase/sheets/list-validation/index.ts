import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Data quality', 'zh-CN': '数据质量' },
  title: { 'en-US': 'List Data Validation', 'zh-CN': '下拉列表数据验证' },
  description: {
    'en-US':
      'Compare native single-select and multi-select lists, live range sources, chips, arrows and invalid values across a 30-object museum intake.',
    'zh-CN': '用 30 条博物馆入库记录比较原生单选、多选、动态范围来源、标签、箭头和无效值。',
  },
  tags: {
    'en-US': ['Validation', 'Dropdown', 'Multi-select', 'Data quality'],
    'zh-CN': ['数据验证', '下拉列表', '多选', '数据质量'],
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-data-validation'],
  apis: [
    { name: 'FUniver.newDataValidation(); FDataValidationBuilder.requireValueInList() / requireValueInRange()' },
    { name: 'FDataValidationBuilder.setAllowBlank() / setAllowInvalid() / setOptions() / build()' },
    { name: 'FRange.setDataValidation() / getDataValidations() / getValidatorStatus()' },
    { name: 'FRange.setValue() / clearContent() / activate() / getRawValues()' },
    { name: 'FWorkbook.save(); FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Morrow Museum is an original fictional intake register with 30 distinct objects, estimates, reviewers and accession notes. B2:B31 starts with a single-select category rule. Repeated valid categories are intentional; B4 is Unknown, B5 is blank, and B31 contains Paper,Textiles. The review date is fixed at 2027-03-31. All controls and both official Preset styles come from the exported factory.',
      'zh-CN':
        '原创虚构 Morrow 博物馆入库表包含 30 件不同藏品、估价、审核人和登记备注。B2:B31 初始采用单选规则，合法分类可重复；B4 为 Unknown，B5 为空，B31 为 Paper,Textiles。审核日期固定为 2027-03-31。所有操作及两份官方 Preset 样式均来自可导出的共享入口。',
    },
    tryIt: {
      'en-US': [
        'Open B2’s native dropdown and choose Paper. Compare the visible chip with SDK value and validation readback.',
        'Select Multiple select and Apply rule. B31’s two categories should now be valid; switch back to single and compare without rewriting its value.',
        'Compare Chips, Arrow and Plain text. Apply changes rendering, while values and validation criteria are retained.',
        'Choose Live cells H2:H6 and Apply rule, then edit the source cells in Univer to change the available categories.',
        'Select B4 or B5. Write Paper or Unknown, clear the cell and toggle Allow blank. Sample validity depends on the live source. Disable Allow invalid input and apply to test native rejection; Facade writes demonstrate validation of existing data, not native input enforcement.',
        'Remove the rule while keeping values, then reapply it. Save & reload preserves the live workbook and rules. Edit B34 to verify its real saved value; Reset intake restores the original review date as well as all data and options.',
        'Choose a fixture and press Load fixture: mixed intake, blank categories, an invalid batch or no rule. Loading replaces edits; changing the selector alone does nothing. Download snapshot JSON saves the actual workbook, not an XLSX file.',
        'Use native Undo/Redo after choosing a dropdown item. On Windows, beta.2 multiline plain-text paste can add trailing spaces to CRLF-separated rows; inspect exact cell values. This known issue can turn a valid category into an invalid one.',
      ],
      'zh-CN': [
        '打开 B2 的原生下拉菜单，选择 Paper，并比较可见标签、SDK 值及验证结果。',
        '选择 Multiple select 后应用规则，B31 的两个分类应变为合法；再切回单选，比较不改值时的验证差异。',
        '比较 Chips、Arrow 和 Plain text，应用后只改变展示方式，保留值与验证条件。',
        '选择 Live cells H2:H6 并应用，在 Univer 内编辑来源单元格，观察可选分类变化。',
        '选择 B4 或 B5，写入 Paper 或 Unknown、清空并切换 Allow blank。示例是否合法取决于实时来源。取消 Allow invalid input 并应用后体验原生输入拒绝；Facade 写入展示已有数据验证，不等于原生输入拦截。',
        '移除规则时保留值，再重新应用。编辑 B34 后保存恢复，验证真实日期值；Reset intake 恢复初始审核日期、全部数据与配置。',
        '选择状态并点击 Load fixture：混合初始、空分类、无效批次或无规则。加载会替换编辑；只改下拉选择不会修改工作簿。Download snapshot JSON 下载实际工作簿快照，不是 XLSX。',
        '原生下拉选择支持撤销/重做。Windows 上 beta.2 多行纯文本粘贴可能在 CRLF 分隔的行末增加空格，需检查实际单元格值；这个已知问题可能让合法分类变为无效。',
      ],
    },
    expected: {
      'en-US':
        'SDK readback reports actual rules, values, the raw column-major validation matrix and statuses keyed B2–B31. Rule changes do not sanitize old data. Reload clears Undo history; reset and theme replacement discard edits. SDK beta.2 can throw during immediate teardown after a rule change because pending automatic row-height work accesses a disposed workbook; the failing ownership regression is retained. All data is local; no service is required.',
      'zh-CN':
        '读回展示 SDK 实际规则、分类值、按列组织的原始验证矩阵及 B2–B31 地址对应状态。修改规则不会清洗旧数据。重新加载清空撤销历史；重置和主题切换丢弃编辑。SDK beta.2 在规则变更后立即销毁时，待执行自动行高计算可能访问已销毁工作簿而报错；保留失败的生命周期回归记录。数据均在本地，无需服务。',
    },
  },
  variants: [
    {
      id: 'single',
      label: { 'en-US': 'Single-select category', 'zh-CN': '单选分类' },
      description: {
        'en-US': 'One allowed material per cell. Choosing an item in the native dropdown replaces the previous value.',
        'zh-CN': '每格一个合法材质；原生下拉选择新项会替换旧值。',
      },
    },
    {
      id: 'multiple',
      label: { 'en-US': 'Multiple materials in one cell', 'zh-CN': '单格多个材质' },
      description: {
        'en-US':
          'The native menu toggles individual items and persists an SDK-serialized list. Applying this rule revalidates B31 without rewriting it.',
        'zh-CN': '原生菜单逐项勾选或取消，以 SDK 列表序列化格式保存。应用规则时重新验证 B31，但不改写原值。',
      },
    },
    {
      id: 'source',
      label: { 'en-US': 'Fixed options or live H2:H6', 'zh-CN': '固定选项或动态 H2:H6' },
      description: {
        'en-US':
          'Fixed options belong to the rule. The range variant references editable H2:H6; changing H2 to Unknown can make the existing B4 valid.',
        'zh-CN': '固定选项存于规则中；范围变体引用可编辑的 H2:H6，将 H2 改为 Unknown 后，原有 B4 可变为合法。',
      },
    },
    {
      id: 'render',
      label: { 'en-US': 'Chips, arrow or text', 'zh-CN': '标签、箭头或文本' },
      description: {
        'en-US':
          'Rendering is separate from validation: all three appearances retain the values and chosen criteria. Apply commits the selected appearance.',
        'zh-CN': '展示与验证独立：三种外观均保留值和所选条件，点击 Apply 后提交外观变更。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'Allow or disallow blank', 'zh-CN': '允许或禁止空值' },
      description: {
        'en-US':
          'B5 starts empty. Disallowing blanks changes its validation status without inventing a replacement category.',
        'zh-CN': 'B5 初始为空；禁止空值只改变验证结果，不会自动补一个分类。',
      },
    },
    {
      id: 'input',
      label: { 'en-US': 'Allow invalid input or reject native typing', 'zh-CN': '允许无效值或拒绝原生输入' },
      description: {
        'en-US':
          'WARNING accepts invalid native typing and marks it. STOP opens the SDK rejection dialog and retains the prior value. Facade sample writes are a different path; inspect validation readback.',
        'zh-CN':
          'WARNING 保留并标记无效原生输入；STOP 打开 SDK 拒绝对话框并保留旧值。Facade 示例写入是另一条路径，需查看读回验证结果。',
      },
    },
    {
      id: 'boundary',
      label: { 'en-US': 'Unknown, duplicate and last-row values', 'zh-CN': '未知、重复及末行值' },
      description: {
        'en-US':
          'Different objects can share a category. B4 tests list membership, B5 blank policy, and B31 the final row and single/multiple compatibility.',
        'zh-CN': '不同藏品可以重复使用同一分类。B4 检查列表成员资格，B5 检查空值，B31 检查末行覆盖和单选/多选兼容性。',
      },
    },
  ],
  actions: [
    {
      id: 'fixture',
      label: { 'en-US': 'Load a reproducible fixture', 'zh-CN': '加载可复现案例状态' },
      description: {
        'en-US':
          'Host fixture selection calls disposeUnit()/createWorkbook() and applies the named rule policy. All four states reset source cells and B34. Invalid batch tests Glass, lowercase ceramic, Unknown, blank, numeric zero and the last-row multi-value.',
        'zh-CN':
          '宿主状态选择通过 disposeUnit()/createWorkbook() 重建数据并应用对应规则。四种状态均恢复来源单元格及 B34；无效批次覆盖 Glass、小写 ceramic、Unknown、空值、数值零及末行多值。',
      },
    },
    {
      id: 'download',
      label: { 'en-US': 'Download the live snapshot', 'zh-CN': '下载实时快照' },
      description: {
        'en-US':
          'FWorkbook.save() captures all sheets, cells, styles, geometry and plugin resources. A local Blob downloads morrow-museum-validation.json. This is host JSON delivery, not an Office-format export or server request.',
        'zh-CN':
          'FWorkbook.save() 获取全部工作表、单元格、样式、尺寸及插件资源，由本地 Blob 下载 morrow-museum-validation.json。这是宿主 JSON 下载，不是 Office 格式导出，也不请求服务器。',
      },
    },
    {
      id: 'apply',
      label: { 'en-US': 'Apply rule', 'zh-CN': '应用规则' },
      description: {
        'en-US': 'Build a list rule and setDataValidation() on B2:B31 without overwriting values.',
        'zh-CN': '构建列表规则并通过 setDataValidation() 应用于 B2:B31，保留原值。',
      },
    },
    {
      id: 'remove',
      label: { 'en-US': 'Remove rule', 'zh-CN': '移除规则' },
      description: {
        'en-US': 'setDataValidation(null) clears validation only; disabled when no rule exists.',
        'zh-CN': 'setDataValidation(null) 仅清除验证；没有规则时禁用。',
      },
    },
    {
      id: 'target',
      label: { 'en-US': 'Select a comparison cell', 'zh-CN': '选择对比单元格' },
      description: {
        'en-US': 'activate() and scrollToCell() reveal B2, B4, B5 or B31 in the native grid.',
        'zh-CN': 'activate() 与 scrollToCell() 在原生表格定位 B2、B4、B5 或 B31。',
      },
    },
    {
      id: 'values',
      label: { 'en-US': 'Named samples or blank value', 'zh-CN': '指定示例值或空值' },
      description: {
        'en-US':
          'setValue() writes Paper (Paper,Textiles in multiple mode) or Unknown; clearContent() removes target content. Validity follows the actual rule/source, not the sample label. Identical writes and clearing an empty target are disabled. Inspect getValidatorStatus().',
        'zh-CN':
          'setValue() 写入 Paper（多选时为 Paper,Textiles）或 Unknown，clearContent() 清空内容。是否合法以实际规则和来源为准，不以示例名称为准。值相同或目标已空时禁用对应操作，通过 getValidatorStatus() 比较结果。',
      },
    },
    {
      id: 'reload',
      label: { 'en-US': 'Save and reload', 'zh-CN': '保存并恢复' },
      description: {
        'en-US': 'save(), disposeUnit() and createWorkbook() round-trip cells and validation resources.',
        'zh-CN': 'save()、disposeUnit() 与 createWorkbook() 保存恢复值与验证资源。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Empty all categories', 'zh-CN': '清空全部分类' },
      description: {
        'en-US': 'clearContent() on B2:B31 keeps objects, sources and validation rules.',
        'zh-CN': 'clearContent() 清空 B2:B31，保留藏品、来源和规则。',
      },
    },
    {
      id: 'reset',
      label: { 'en-US': 'Reset intake', 'zh-CN': '重置入库案例' },
      description: {
        'en-US': 'Recreate the original snapshot and reapply default single-select chips.',
        'zh-CN': '重建初始快照并应用默认单选标签。',
      },
    },
  ],
  states: [
    {
      id: 'default',
      label: { 'en-US': 'Mixed initial intake', 'zh-CN': '混合初始数据' },
      description: {
        'en-US':
          'Load Mixed initial intake or Reset intake: original single-select chips, blanks allowed and warning input policy.',
        'zh-CN': '加载 Mixed initial intake 或重置：初始单选标签、允许空值及警告输入策略。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Blank categories with rules retained', 'zh-CN': '保留规则的空分类' },
      description: {
        'en-US':
          'Load Blank categories: all 30 category cells are blank, while distinct objects, sources, review date and default rule remain. Empty categories instead clears the current values without resetting the current rule.',
        'zh-CN':
          '加载 Blank categories：30 个分类全空，保留各件藏品、来源、日期及默认规则。Empty categories 按钮则仅清除实时分类值，不重置当前规则。',
      },
    },
    {
      id: 'error',
      label: { 'en-US': 'Invalid batch', 'zh-CN': '无效批次' },
      description: {
        'en-US':
          'Load Invalid batch: B2/B3/B4/B5/B6/B31 fail single-select validation with blanks disallowed. Invalid values remain visible; the state does not simulate a runtime exception.',
        'zh-CN':
          '加载 Invalid batch：禁止空值时，B2/B3/B4/B5/B6/B31 均不符合单选规则。保留无效值以供观察，不伪造运行时异常。',
      },
    },
    {
      id: 'removed',
      label: { 'en-US': 'Unvalidated values', 'zh-CN': '无验证规则的值' },
      description: {
        'en-US':
          'Load No validation rule: original category values with no list rule. Remove rule instead keeps any edits in the current workbook.',
        'zh-CN': '加载 No validation rule：初始分类数据但不附带列表规则。Remove rule 按钮则保留当前工作簿的编辑。',
      },
    },
  ],
}

const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
})
export default { metadata, files, Preview }
