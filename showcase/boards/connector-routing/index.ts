import type { ShowcaseMetadata } from '@/showcase/types'
import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'
const metadata: ShowcaseMetadata = {
  image: '/assets/showcase/boards-connector-routing.png',
  product: 'boards',
  category: 'features',
  group: { 'en-US': 'Diagram connections', 'zh-CN': '图形连接' },
  title: { 'en-US': 'Connector Routing and Bound Endpoints', 'zh-CN': '连接线路由与端点绑定' },
  description: {
    'en-US':
      'Compare four real routes, bound/free endpoints and editable business labels in a native release workflow.',
    'zh-CN': '在原生发布流程中比较四种真实路由、绑定与自由端点，以及可编辑的业务标签。',
  },
  tags: { 'en-US': ['Canvases', 'Connectors', 'Native editing'], 'zh-CN': ['Canvases', '连接线', '原生编辑'] },
  packages: ['@univerjs-pro/boards', '@univerjs-pro/boards-ui', '@univerjs-pro/license'],
  apis: [
    'FBoard.getConnectorConnection() / setConnectorConnection()',
    'FBoard.getConnectorStyle() / setConnectorStyle()',
    'FBoard.getConnectorLabelText() / setConnectorLabelText() / removeConnectorLabel()',
    'FBoard.setElementTransform()',
    'FBoard.undo() / redo() / save()',
    'AnalyzeBoardRenderedLayoutCommand',
  ].map((name) => ({ name })),
  guide: {
    overview: {
      'en-US':
        'Eight original nodes, two decisions and twelve connectors distinguish a visible line from a durable endpoint relationship. Real labels and four routing styles tell different success, failure, retry and deployment stories.',
      'zh-CN':
        '八个原创节点、两个判断分支与十二条连接线，区分可见线条和持久端点关系。真实标签与四种路由分别展示成功、失败、重试和部署过程。',
    },
    tryIt: {
      'en-US': [
        'Select an actual connector to open its native floating toolbar and change routing or markers.',
        'Drag Tests and inspect the connected routes, then use native history.',
        'Double-click the Pass label and edit it in the native text editor.',
        'Run README variants for manual waypoints, detachment, promotion repair, validation and local snapshot lifecycle.',
      ],
      'zh-CN': [
        '选择真实连接线，通过原生浮动工具条修改路由或箭头。',
        '拖动 Tests，观察关联路径并使用原生历史。',
        '双击 Pass 标签，在原生文字编辑器中修改。',
        '运行 README 中的手动途经点、脱开、晋级连接修复、校验及本地快照生命周期代码。',
      ],
    },
    expected: {
      'en-US':
        'Native Canvas tools, seven official CSS/locale packs and same-owner themes. The graph retains endpoint identities when nodes move. Direct/curved routes are not guaranteed to avoid obstacles; the red promotion starts free. SDK limitations are not repaired with host simulation.',
      'zh-CN':
        '使用原生 Canvases 工具、七套官方 CSS/语言包及同实例主题切换。节点移动保留端点身份。直线与曲线不保证避障，红色晋级路径初始为自由端点，不使用宿主模拟修补 SDK 限制。',
    },
  },
  variants: [
    {
      id: 'routing',
      label: { 'en-US': 'Orthogonal / straight / curve / manual', 'zh-CN': '正交 / 直线 / 曲线 / 手动' },
      description: {
        'en-US': 'Different native route geometries exist together; README compares them on one failure branch.',
        'zh-CN': '不同原生路由同时存在，README 在同一失败分支上逐一比较。',
      },
    },
    {
      id: 'endpoints',
      label: { 'en-US': 'Bound / free / repaired', 'zh-CN': '绑定 / 自由 / 修复' },
      description: {
        'en-US': 'Node-site bindings follow movement; deliberate free points remain separate.',
        'zh-CN': '节点连接点随节点移动，自由点保持独立。',
      },
    },
    {
      id: 'appearance',
      label: { 'en-US': 'Labels, strokes and arrows', 'zh-CN': '标签、线条与箭头' },
      description: {
        'en-US': 'Business labels, solid/dashed colored lines and open/filled arrows are actual native objects.',
        'zh-CN': '业务标签、彩色实线虚线及开口实心箭头均为实际原生对象。',
      },
    },
  ],
  actions: [
    {
      id: 'native',
      label: { 'en-US': 'Native select, drag and edit', 'zh-CN': '原生选择、拖动与编辑' },
      description: {
        'en-US': 'Use the Canvas floating toolbar, canvas and native history instead of duplicate host buttons.',
        'zh-CN': '使用 Canvases 浮动工具条、画布与原生历史，不重复设置宿主按钮。',
      },
    },
    {
      id: 'literal',
      label: { 'en-US': 'Run real Facade variants', 'zh-CN': '运行真实 Facade 变体' },
      description: {
        'en-US': 'README retains explicit feature variants, rejected inputs and local save/restore code.',
        'zh-CN': 'README 保留明确的功能变体、无效输入拒绝与本地保存恢复代码。',
      },
    },
  ],
  states: [
    {
      id: 'workflow',
      label: { 'en-US': 'Original release relationships', 'zh-CN': '原创发布关系' },
      description: {
        'en-US': 'Eight named nodes, twelve labeled edges and one deliberately free promotion target.',
        'zh-CN': '八个命名节点、十二条带标签边以及一处故意自由的晋级目标。',
      },
    },
    {
      id: 'edited',
      label: { 'en-US': 'Edited routing and bindings', 'zh-CN': '已编辑路由与绑定' },
      description: {
        'en-US': 'Native and Facade edits are checked against model relationships and actual rendered routes.',
        'zh-CN': '原生与 Facade 编辑同时核对模型关系和实际渲染路径。',
      },
    },
    {
      id: 'invalid',
      label: { 'en-US': 'Rejected missing endpoint', 'zh-CN': '拒绝缺失端点' },
      description: {
        'en-US': 'The intentional missing-target example must reject without changing the graph.',
        'zh-CN': '故意指定缺失目标的示例必须拒绝且不改变原图。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Empty / restored local page', 'zh-CN': '本地空白 / 已恢复页面' },
      description: {
        'en-US': 'README covers an empty page and restoring the complete saved workflow; history is not persisted.',
        'zh-CN': 'README 覆盖空白页面及完整流程快照恢复，不持久化撤销历史。',
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
