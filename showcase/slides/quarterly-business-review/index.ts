import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/slides-quarterly-business-review.png',
  product: 'slides' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Business reviews', 'zh-CN': '业务复盘' },
  title: { 'en-US': 'Quarterly Business Review', 'zh-CN': '季度业务复盘' },
  description: {
    'en-US':
      'An eight-page leadership review with editable native shapes, regional comparisons, revenue movement, renewal risks and speaker notes.',
    'zh-CN': '八页原生业务复盘，包含可编辑形状、区域比较、收入变化、续约风险及演讲者备注。',
  },
  tags: { 'en-US': ['Slides', 'QBR', 'Speaker Notes'], 'zh-CN': ['演示文稿', 'QBR', '演讲者备注'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui'],
  apis: [
    { name: 'FUniver.createPresentation()' },
    { name: 'FPresentation.getSlideById()' },
    { name: 'FShapeText.setText()' },
    { name: 'FSlide.setSpeakerNotes()' },
    { name: 'FPresentation.setActiveSlide()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Original Northstar Q2 review. Use native Grid tools to edit text, styling and geometry; use the page list and Speaker notes. Values and comparison bars are authored, not formula-linked.',
      'zh-CN':
        '原创 Northstar Q2 复盘，通过原生 Grid 菜单编辑文字、样式与几何位置，通过页面列表导航并编辑备注。数字和比较条是作者内容，不是公式联动。',
    },
    tryIt: {
      'en-US': [
        'Edit the target shape with native text tools; update the gap separately.',
        'Open Regional Performance using the native page list.',
        'Review the remaining six pages and record the decision in Speaker notes.',
      ],
      'zh-CN': [
        '使用原生工具编辑目标文字，并单独更新差额。',
        '使用原生页面列表打开区域表现。',
        '阅读其余六页，并在演讲者备注中记录决策。',
      ],
    },
    expected: {
      'en-US':
        'All eight pages remain editable. A $46.5M target against $43.8M actual implies a $2.7M gap; edit both labels explicitly. Theme changes preserve the current deck.',
      'zh-CN':
        '八页均可编辑。目标改为 46.5M 美元且实际为 43.8M 时差额为 2.7M；应明确编辑两个标签。主题切换保留当前演示文稿。',
    },
  },
  variants: [
    { id: 'scorecard', label: { 'en-US': 'KPI Scorecard', 'zh-CN': 'KPI 记分卡' } },
    { id: 'regions', label: { 'en-US': 'Regional Performance', 'zh-CN': '区域表现' } },
    { id: 'drivers', label: { 'en-US': 'Revenue Movement', 'zh-CN': '收入变化' } },
    { id: 'customers', label: { 'en-US': 'Retention Review', 'zh-CN': '留存复盘' } },
    { id: 'pipeline-review', label: { 'en-US': 'Pipeline Stages', 'zh-CN': '管线阶段' } },
    { id: 'execution', label: { 'en-US': 'Operating Rhythm', 'zh-CN': '执行节奏' } },
    { id: 'risks', label: { 'en-US': 'Risks and Responses', 'zh-CN': '风险与应对' } },
    { id: 'decision', label: { 'en-US': 'Leadership Decision', 'zh-CN': '经营决策' } },
  ],
  actions: [
    { id: 'raise-target', label: { 'en-US': 'Raise Q2 target', 'zh-CN': '提高 Q2 目标' } },
    { id: 'show-regions', label: { 'en-US': 'Show regions', 'zh-CN': '显示区域表现' } },
    { id: 'notes', label: { 'en-US': 'Edit speaker notes', 'zh-CN': '编辑演讲者备注' } },
  ],
  states: [
    { id: 'baseline', label: { 'en-US': '$45.0M target', 'zh-CN': '45.0M 美元目标' } },
    { id: 'revised', label: { 'en-US': '$46.5M target', 'zh-CN': '46.5M 美元目标' } },
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
