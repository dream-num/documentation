import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  image: '/assets/showcase/slides-technical-architecture-overview.png',
  product: 'slides' as const,
  category: 'showcases' as const,
  group: { 'en-US': 'Technical communication', 'zh-CN': '技术沟通' },
  title: { 'en-US': 'Technical Architecture Overview', 'zh-CN': '技术架构概览' },
  description: {
    'en-US':
      'Explain component ownership, host-to-Facade flow and local snapshot recovery across three editable native slides.',
    'zh-CN': '通过三页可编辑原生幻灯片说明组件归属、宿主与 Facade 流程及本地快照恢复。',
  },
  tags: { 'en-US': ['Slides', 'Architecture', 'Shapes'], 'zh-CN': ['演示文稿', '架构', '形状'] },
  packages: ['@univerjs-pro/slides', '@univerjs-pro/slides-ui', '@univerjs-pro/engine-shape'],
  apis: [
    { name: 'FUniver.createPresentation()' },
    { name: 'FSlide.getElementById()' },
    { name: 'FShape.setAbsolutePosition()' },
    { name: 'FShape.setTransform()' },
    { name: 'FShapeText.setText()' },
    { name: 'FSlide.setSpeakerNotes()' },
  ],
  guide: {
    overview: {
      'en-US':
        'A host/runtime/render/data component map using deterministic shapes, text labels, and element transforms. Arrows are text labels, not attached connectors; this case does not validate graph connectivity.',
      'zh-CN':
        '使用确定性形状、文本标签和元素变换构成宿主、运行时、渲染及数据组件图。箭头是文本标签而非吸附连接线，本案例不验证图的连通性。',
    },
    tryIt: {
      'en-US': [
        'Inspect the component and flow layout.',
        'Move the Local Data Layer with native tools or the literal Facade recipe.',
        'Read the command-flow and recovery pages; edit native Speaker notes.',
      ],
      'zh-CN': [
        '查看三页组件与流程布局。',
        '通过原生工具或逐字 Facade 示例移动本地数据层。',
        '阅读命令流程与恢复页面，并编辑原生备注。',
      ],
    },
    expected: {
      'en-US':
        'The component and its label can be edited repeatedly. Native page navigation, same-owner themes and complete snapshot recipes preserve authored content. Diagram arrows are not attached connectors.',
      'zh-CN': '组件和标签可重复编辑。原生页面导航、同实例主题切换与完整快照示例保留作者内容；图示箭头不是绑定连接线。',
    },
  },
  variants: [
    { id: 'centered', label: { 'en-US': 'Centered data layer', 'zh-CN': '居中数据层' } },
    { id: 'right', label: { 'en-US': 'Right-side data layer', 'zh-CN': '右侧数据层' } },
  ],
  actions: [
    { id: 'move-data', label: { 'en-US': 'Move data layer', 'zh-CN': '移动数据层' } },
    { id: 'notes', label: { 'en-US': 'Edit speaker notes', 'zh-CN': '编辑演讲者备注' } },
  ],
  states: [
    { id: 'centered', label: { 'en-US': 'Original component layout', 'zh-CN': '原始组件布局' } },
    { id: 'moved', label: { 'en-US': 'Data layer and label moved', 'zh-CN': '数据层与标签已移动' } },
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
