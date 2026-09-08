import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata = {
  product: 'sheets' as const,
  image: '/assets/showcase/sheets-conditional-format-visuals.png',
  category: 'features' as const,
  group: { 'en-US': 'Formatting', 'zh-CN': '格式' },
  title: { 'en-US': 'Conditional Format Visuals', 'zh-CN': '条件格式视觉效果' },
  description: {
    'en-US': 'Compare two/three-colour scales, signed solid/gradient bars and numeric icon thresholds.',
    'zh-CN': '对比双色与三色色阶、正负实心与渐变数据条以及数值图标阈值。',
  },
  tags: { 'en-US': ['Colour scale', 'Data bar', 'Icon set'], 'zh-CN': ['色阶', '数据条', '图标集'] },
  packages: ['@univerjs/preset-sheets-core', '@univerjs/preset-sheets-conditional-formatting'],
  apis: [
    { name: 'FConditionalFormattingBuilder.setColorScale()' },
    { name: 'FConditionalFormattingBuilder.setDataBar()' },
    { name: 'FConditionalFormattingBuilder.setIconSet()' },
  ],
  variants: [
    { id: 'scales', label: { 'en-US': 'Two and three colours', 'zh-CN': '双色与三色' } },
    { id: 'bars', label: { 'en-US': 'Signed solid and gradient bars', 'zh-CN': '正负实心与渐变数据条' } },
    { id: 'icons', label: { 'en-US': 'Icons with and without values', 'zh-CN': '显示与隐藏数值的图标' } },
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
