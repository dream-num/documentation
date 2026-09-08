import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-date-number-validation.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Data quality', 'zh-CN': '数据质量' },
  title: { 'en-US': 'Date and Number Validation', 'zh-CN': '日期与数字验证' },
  description: {
    'en-US':
      'Compare whole numbers, decimals, strict comparisons and date boundaries with native invalid markers and allowed blanks.',
    'zh-CN': '对比整数、小数、严格比较及日期边界，观察原生无效标记与允许空值。',
  },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-data-validation'],
  tags: { 'en-US': ['Validation', 'Dates', 'Integers', 'Boundaries'], 'zh-CN': ['验证', '日期', '整数', '边界'] },
  apis: [
    { name: 'FDataValidationBuilder.requireNumberBetween() / requireNumberGreaterThan()' },
    { name: 'FDataValidationBuilder.requireDateBetween() / requireDateBefore() / requireDateOnOrAfter()' },
    { name: 'FRange.getValidatorStatus() / getDataValidationErrorAsync()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Two native worksheets compare three numeric and three date rules. Amber inputs include valid boundaries, invalid values and blanks. The SDK supplies validation markers; no host error panel is added.',
      'zh-CN':
        '两张原生工作表对比三种数字与三种日期规则。琥珀色输入包含有效边界、无效值与空白；验证标记来自 SDK，不增加宿主错误面板。',
    },
    tryIt: {
      'en-US': [
        'On Numbers, type 2.5 then 2 into B4 to compare fractional and whole values.',
        'Compare decimal 0.25 in C4 with zero and 0.5 in strictly-positive D4.',
        'On Dates, inspect the opening day across all three columns; then type 2027-08-31 and 2027-09-01.',
        'Delete an input to test allowed blanks, or inspect the actual rule in Data > Data validation.',
      ],
      'zh-CN': [
        '在 Numbers 的 B4 输入 2.5 再输入 2。',
        '对比 C4 的 0.25 和 D4 的 0、0.5。',
        '在 Dates 对比起始日期在三列中的结果，再输入 2027-08-31、2027-09-01。',
        '删除输入测试允许空值，通过 Data > Data validation 检查规则。',
      ],
    },
    expected: {
      'en-US':
        'Invalid input remains visible and is marked, not rejected or sanitized. Whole-number validation differs from decimal formatting; date formatting differs from date validation. English UI, full locale packs and official CSS are shared by preview and export.',
      'zh-CN':
        '无效值保留并标记，不拒绝或清洗。整数验证不同于小数格式，日期显示格式也不等于日期验证；预览与导出共享英文界面、完整语言包及官方 CSS。',
    },
  },
  variants: [
    { id: 'integer', label: { 'en-US': 'Whole numbers / inclusive bounds', 'zh-CN': '整数 / 包含边界' } },
    { id: 'decimal', label: { 'en-US': 'Decimals / fractions allowed', 'zh-CN': '小数 / 允许分数值' } },
    { id: 'positive', label: { 'en-US': 'Strictly positive / zero invalid', 'zh-CN': '严格正数 / 零无效' } },
    { id: 'window', label: { 'en-US': 'Inclusive date window', 'zh-CN': '包含边界的日期区间' } },
    { id: 'before', label: { 'en-US': 'Before / opening day excluded', 'zh-CN': '之前 / 排除当天' } },
    { id: 'after', label: { 'en-US': 'On or after / opening day included', 'zh-CN': '当天或之后' } },
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
