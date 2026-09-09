import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

function option(id: string, en: string, zh: string, enDetail: string, zhDetail: string) {
  return { id, label: { 'en-US': en, 'zh-CN': zh }, description: { 'en-US': enDetail, 'zh-CN': zhDetail } }
}
const metadata = {
  image: '/assets/showcase/embed-univer-events-to-host.png',
  product: 'embed' as const,
  category: 'features' as const,
  group: { 'en-US': 'Host integration', 'zh-CN': '宿主集成' },
  title: { 'en-US': 'Univer Events to Host', 'zh-CN': 'Univer 事件通知宿主' },
  description: {
    'en-US':
      'Observe native milestone edits and selections in a bounded host event feed; unsubscribe and rebind without stopping the editor.',
    'zh-CN': '在宿主日志观察原生里程碑编辑与选区事件，取消与恢复订阅，不中断编辑器。',
  },
  tags: { 'en-US': ['Embed', 'Events', 'Host integration'], 'zh-CN': ['嵌入', '事件', '宿主集成'] },
  packages: [
    '@univerjs/core',
    '@univerjs/presets',
    '@univerjs/preset-sheets-core',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
  ],
  apis: [
    { name: 'FUniver.addEvent()' },
    { name: 'FUniver.Event.SheetValueChanged' },
    { name: 'FWorkbook.onSelectionChange()' },
    { name: 'IDisposable.dispose()' },
    { name: 'FRange.setValue() / activate() / getRawValues() / getA1Notation()' },
    { name: 'FWorkbook.save()' },
    { name: 'FUniver.disposeUnit() / createWorkbook()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Juniper launch has eight distinct milestones. The host records SDK value and selection events, not synthetic button-click messages. Explicit Save is a host action that reads FWorkbook.save(), not an SDK save-completed event.',
      'zh-CN':
        'Juniper 发布计划包含八个不同里程碑。宿主记录 SDK 的数值与选区事件，不伪造按钮点击日志。保存是宿主调用 FWorkbook.save() 的操作，不是 SDK 保存完成事件。',
    },
    tryIt: {
      'en-US': [
        'Type a new progress value into native C4; inspect SheetValueChanged, then use native Undo.',
        'Click native E4 and inspect onSelectionChange zero-based coordinates. README explains why activate() alone is not a substitute for the native callback.',
        'Unsubscribe, then edit and select natively: the workbook changes but the feed stops. Subscribe again; missed value events are not replayed.',
        'Run README literals for independent subscriptions, validated host writes and complete in-memory snapshots; no network or disk persistence is implied.',
        'Clear only the feed. README retains Empty, Boundary, invalid-input and same-ID recovery variants without runtime fixture/reset panels.',
      ],
      'zh-CN': [
        '直接在原生 C4 输入进度，检查 SheetValueChanged 的受影响范围与数据，再使用原生撤销。',
        '点击原生 E4 查看 onSelectionChange 的零起始坐标；README 说明仅 activate() 不能替代原生回调。',
        '取消订阅后继续原生编辑与选择：工作簿变化但日志停止；恢复订阅不重放遗漏的值事件。',
        '运行 README 的独立订阅、校验写入和完整内存快照代码，不涉及网络或磁盘持久化。',
        '清空仅影响日志；README 保留空模板、边界、非法输入和同 ID 恢复变体，运行界面不再放重置面板。',
      ],
    },
    expected: {
      'en-US':
        'Latest 12 actual SDK callbacks retain sequence numbers and immutable received payloads. Unsubscribe releases both handles; rebinding does not replay missed value events. Native editing stays available. Preview/export share source, the complete English pack and official CSS; theme changes preserve the owner, edits and feed.',
      'zh-CN':
        '最近 12 条真实 SDK 回调保留序号和收到时的独立载荷。取消订阅释放两项监听，恢复不重放遗漏值事件；原生编辑始终可用。预览与导出共享源码、完整英文语言包及官方 CSS，主题保留 owner、编辑和日志。',
    },
  },
  variants: [
    option(
      'values',
      'Value event payloads',
      '数值事件载荷',
      'Host and native edits produce SDK-reported affected ranges and values.',
      '宿主与原生编辑产生 SDK 回报的影响范围和数据。',
    ),
    option(
      'selection',
      'Selection events',
      '选区事件',
      'Native selection produces callbacks; FRange.activate() updates the separately reported SDK selection. Subscription can initially report the current selection.',
      '原生选择产生回调；FRange.activate() 更新独立回读的 SDK 选区。订阅时可能立即回报当前选区。',
    ),
    option(
      'subscription',
      'Unsubscribe and resume',
      '取消与恢复订阅',
      'Dispose both activity listeners; resume without replaying missed events.',
      '释放两项活动监听，恢复时不重放遗漏事件。',
    ),
    option(
      'snapshot',
      'Explicit host save',
      '显式宿主保存',
      'Retain the complete FWorkbook.save() result in host memory independently of future edits.',
      '将完整 FWorkbook.save() 结果保存在宿主内存，不受后续编辑影响。',
    ),
  ],
  actions: [
    option(
      'write',
      'README: validated host write',
      'README：校验宿主写入',
      'Validate an integer 0–100 and the audit milestone identity, then call FRange.setValue() on C4.',
      '校验 0–100 整数及里程碑身份，再通过 FRange.setValue() 写入 C4。',
    ),
    option(
      'select',
      'README: activate E4',
      'README：定位 E4',
      'FRange.activate() selects the real next-step cell.',
      'FRange.activate() 选中真实的下一步单元格。',
    ),
    option(
      'subscription',
      'Unsubscribe / subscribe',
      '取消／恢复订阅',
      'Release or register the addEvent(SheetValueChanged) and FWorkbook.onSelectionChange() handles.',
      '释放或注册 addEvent(SheetValueChanged) 与 FWorkbook.onSelectionChange() 的订阅。',
    ),
    option(
      'save',
      'README: host-memory snapshot',
      'README：宿主内存快照',
      'Copy the full FWorkbook.save() result; this is not an SDK event, file conversion or backend save.',
      '复制完整 FWorkbook.save() 结果，不是 SDK 事件、文件转换或后端保存。',
    ),
    option(
      'clear',
      'Clear activity',
      '清空活动',
      'A host-only action clears visible entries without changing the workbook, subscriptions or saved snapshot.',
      '仅宿主操作，清除可见日志，不改变工作簿、订阅或保存快照。',
    ),
    option(
      'fixture',
      'README: startup data variants',
      'README：启动数据变体',
      'disposeUnit()/createWorkbook() load default, empty or boundary data and re-subscribe.',
      '通过 disposeUnit()/createWorkbook() 加载默认、空或边界数据并重新订阅。',
    ),
    option(
      'reset',
      'README: recreate original milestones',
      'README：重建原里程碑',
      'Restore the original eight rows, clear host history/saved snapshot, and re-subscribe.',
      '恢复原始八行，清除宿主日志及保存快照，并重新订阅。',
    ),
  ],
  states: [
    option(
      'default',
      'Default',
      '默认',
      'Eight milestones with varied owners, progress, dates and next steps.',
      '八项里程碑的负责人、进度、日期和下一步均不同。',
    ),
    option(
      'empty',
      'Empty',
      '空',
      'Keep the template headers; the README guarded write rejects the absent audit milestone. Native editing is available.',
      '保留模板表头；README 校验写入在缺失审计里程碑时拒绝；原生仍可编辑。',
    ),
    option(
      'boundary',
      'Boundary',
      '边界',
      'The first two progress values are 0 and 100; all other rows remain distinct.',
      '前两项进度为 0 和 100，其余各行仍保留不同数据。',
    ),
    option(
      'error',
      'Invalid host input',
      '非法宿主输入',
      'README guarded writes reject -1, 101 or 1.5 before calling setValue(), preserving the workbook and SDK feed.',
      'README 校验写入在 setValue() 前拒绝 -1、101 或 1.5，保留工作簿及 SDK 活动。',
    ),
  ],
}

export const files = readShowcaseFiles(import.meta.url, {
  '/src/index.ts': './code/index.ts',
  '/src/create-demo.ts': './code/create-demo.ts',
  '/src/data.ts': './code/data.ts',
  '/src/styles.css': './code/styles.css',
  '/README.md': './code/README.md',
  '/reference/preview.tsx.txt': './preview/main.tsx',
})
export default { metadata, files, Preview }
