import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/sheets-number-format-gallery.png',
  product: 'sheets' as const,
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式设置' },
  title: { 'en-US': 'Number Format Gallery', 'zh-CN': '数字格式对照' },
  description: {
    'en-US':
      'Compare 20 native number-format samples: decimals, currencies, accounting, fractions, percentages, dates, elapsed time and custom patterns without changing numeric values.',
    'zh-CN': '用 20 组原生格式对照展示小数、货币、会计、分数、百分比、日期、累计时长和自定义格式，不改变实际数值。',
  },
  tags: {
    'en-US': ['Number format', 'Currency', 'Date', 'Duration', 'Custom patterns'],
    'zh-CN': ['数字格式', '货币', '日期', '时长', '自定义格式'],
  },
  packages: ['@univerjs/preset-sheets-core'],
  apis: [
    { name: 'FRange.setNumberFormat()' },
    { name: 'FRange.getNumberFormat() / getDisplayValue() / getRawValue()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A compact native worksheet compares raw values in column B with independently editable formatted copies in column C. Column D records the initial pattern, not a live inspector. No extra host controls duplicate the grid ribbon.',
      'zh-CN':
        '紧凑的原生工作表将 B 列原始值与 C 列可独立编辑的格式化副本并排展示。D 列记录初始格式，并非实时检查器。不添加重复原生网格菜单的宿主按钮。',
    },
    tryIt: {
      'en-US': [
        'Select C5: the grid shows 1,234.57 while the formula bar retains 1234.5678. Change decimal precision with the native ribbon.',
        'Compare C9:C10: percentages use numeric fractions, including a value above 100%.',
        'Compare C13 and C14: the same 1.125 days displays as 27:00 elapsed time or 03:00 clock time.',
        'Select C17 and C18: the custom format has positive, negative and zero sections. Type a positive number in C17 and inspect its plus sign.',
        'Edit C5 directly; B5 intentionally remains the original comparison value. Use the native number-format dialog to try another pattern.',
        'Compare C19:C21 accounting layouts for receipts, refunds and zero; C22:C24 compare mixed fractions, fixed sixteenths and approximate thirds.',
      ],
      'zh-CN': [
        '选择 C5：表格显示 1,234.57，公式栏保留 1234.5678。通过原生菜单调整小数位数。',
        '比较 C9:C10：百分比使用小数值，也可以超过 100%。',
        '比较 C13 和 C14：同一个 1.125 天分别显示累计时长 27:00 和时钟时间 03:00。',
        '选择 C17、C18：自定义格式包含正数、负数、零值分段。在 C17 输入正数，观察加号。',
        '直接编辑 C5，B5 有意保留原始对照值。通过原生数字格式对话框尝试其他格式。',
        '比较 C19:C21 的会计收入、退款与零值布局；C22:C24 比较带分数、固定十六分母和近似三分之一。',
      ],
    },
    expected: {
      'en-US':
        'Formatting changes presentation, not storage precision or currency units. Calendar serials are numeric dates, not timezone conversion. This feature example includes no import, export or collaboration service. The downloadable source uses the same factory and official preset CSS as the preview.',
      'zh-CN':
        '格式只改变展示，不改变存储精度或货币单位。日期序列值是数值日期，不进行时区换算。本功能案例不包含导入、导出或协同服务。下载源码与预览使用同一入口和官方 Preset CSS。',
    },
  },
  actions: [],
  states: [],
  variants: [
    {
      id: 'accounting',
      label: { 'en-US': 'Accounting pattern sections', 'zh-CN': '会计格式分段' },
      description: {
        'en-US':
          'C19:C21 show positive, parenthesized negative and zero-dash sections. The installed SDK does not expand the fill token to align currency symbols at the left cell edge.',
        'zh-CN': 'C19:C21 展示正值、负值括号和零值横线。当前 SDK 未将填充标记展开为货币符号靠单元格左边缘对齐。',
      },
    },
    {
      id: 'fraction',
      label: { 'en-US': 'Mixed and fixed-denominator fractions', 'zh-CN': '带分数与固定分母' },
      description: {
        'en-US':
          'C22:C24 compare reduced fractions, fixed sixteenths and approximation without changing stored values.',
        'zh-CN': 'C22:C24 对比约分、固定十六分母和近似分数，存储值不变。',
      },
    },
    {
      id: 'number',
      label: { 'en-US': 'Decimals and scientific notation', 'zh-CN': '小数与科学计数' },
      description: {
        'en-US': 'C5:C6 compare rounding and compact magnitude without altering raw values.',
        'zh-CN': 'C5:C6 比较舍入显示和紧凑计数，原值不变。',
      },
    },
    {
      id: 'currency',
      label: { 'en-US': 'Currency and negative values', 'zh-CN': '货币与负值' },
      description: {
        'en-US': 'C7:C8 use literal currency symbols and a red negative section.',
        'zh-CN': 'C7:C8 使用货币符号和红色负值分段。',
      },
    },
    {
      id: 'percent',
      label: { 'en-US': 'Percentage precision', 'zh-CN': '百分比精度' },
      description: {
        'en-US': 'C9:C10 compare one and two decimal places, including over-target values.',
        'zh-CN': 'C9:C10 比较一位、两位小数及超额百分比。',
      },
    },
    {
      id: 'date',
      label: { 'en-US': 'Date and timestamp', 'zh-CN': '日期与时间' },
      description: {
        'en-US': 'C11:C12 show a serial date and its fractional-day time.',
        'zh-CN': 'C11:C12 显示日期序列值及小数部分对应的时间。',
      },
    },
    {
      id: 'duration',
      label: { 'en-US': 'Elapsed hours versus clock time', 'zh-CN': '累计小时与时钟时间' },
      description: {
        'en-US': 'C13:C14 distinguish [h]:mm from hh:mm for a duration over 24 hours.',
        'zh-CN': 'C13:C14 用超过 24 小时的时长区分 [h]:mm 与 hh:mm。',
      },
    },
    {
      id: 'custom',
      label: { 'en-US': 'Custom patterns and zero values', 'zh-CN': '自定义格式与零值' },
      description: {
        'en-US': 'C15:C18 cover prefixes, padded digits, units, signed values and zero-as-dash.',
        'zh-CN': 'C15:C18 展示前缀、补零、单位、正负数及零值横线。',
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
