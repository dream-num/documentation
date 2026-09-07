import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'docs-traditional' as const,
  category: 'features' as const,
  group: { 'en-US': 'Typesetting', 'zh-CN': '排版' },
  title: { 'en-US': 'Fonts, Fallback, and Glyphs', 'zh-CN': '字体、回退与字形' },
  description: {
    'en-US':
      'Compare font stacks, size and weight on native multilingual text; distinguish local face availability from glyph coverage.',
    'zh-CN': '比较原生多语言文字的字体栈、字号和粗细，区分本地字体可用性与字形覆盖。',
  },
  tags: { 'en-US': ['Traditional Docs', 'Fonts', 'Fallback'], 'zh-CN': ['传统文档', '字体', '回退'] },
  packages: [
    '@univerjs/preset-docs-core',
    '@univerjs/preset-docs-drawing',
    '@univerjs-pro/docs-table',
    '@univerjs-pro/docs-table-ui',
  ],
  apis: [
    { name: 'FDocument.getTextRange() / getParagraphs() / setSelection()' },
    { name: 'FDocumentTextRange.setTextStyle() / getCommonExplicitTextStyle() / describe()' },
    { name: 'FDocument.undo() / redo() / save()' },
    { name: 'FUniver.createDocument() / syncExecuteCommand()' },
  ],
  guide: {
    overview: {
      'en-US':
        'The Alder Archive report contains twelve authored chapter-page boundaries, a native table and an embedded reference figure. Six editable samples cover Latin, CJK, Arabic/Hebrew, accents, symbols and a private-use glyph. The controls compare real text-range styles; no sample is rendered as an HTML substitute.',
      'zh-CN':
        'Alder Archive 报告包含十二个章节分页边界、原生表格和内嵌参考图。六段可编辑样本覆盖拉丁文、CJK、阿拉伯文／希伯来文、重音、符号及私用字形。控件比较真实文字范围样式，不用 HTML 替代样本文字。',
    },
    tryIt: {
      'en-US': [
        'Expand Demo controls, choose a sample and apply Georgia or Courier New; compare native text and glyph metrics.',
        'Apply 20 pt bold, then Undo and Redo. Family changes preserve the existing size and weight.',
        'Try Missing primary; inspect the local-face failure and explicit fallback without treating it as a glyph-coverage pass.',
        'Choose Whole report text to change all body text, including headings/table text; select a sample in the native editor.',
        'Test empty, large-type and invalid-range states, then reload/download and Reset. Inspect later chapters with native scrolling.',
      ],
      'zh-CN': [
        '展开 Demo controls，选择样本并应用 Georgia 或 Courier New，对比原生文字及字形度量。',
        '应用 20 点粗体，再撤销、重做；单独修改字体族保留字号和粗细。',
        '尝试 Missing primary，检查本地字体失败与显式回退，不将其当作字形覆盖通过。',
        '选择 Whole report text 修改包括标题／表格在内的正文，或在原生编辑器中选中样本。',
        '测试空白、大字号及无效范围状态，再重载／下载和重置；用原生滚动查看后续章节。',
      ],
    },
    expected: {
      'en-US':
        'Text content stays intact while Facade style values and native layout change. Local FontFace probes report regular-face resolution only, not per-glyph coverage or actual fallback identity. CJK/RTL/missing-glyph behavior requires visual acceptance on each platform. Source notes are not native footnotes. State/Reset/theme discard edits/history; JSON is not PDF output.',
      'zh-CN':
        '文字内容保持完整，Facade 样式和原生布局改变。本地 FontFace 探测仅报告常规字面可解析性，不证明逐字形覆盖或实际回退字体。CJK、RTL 和缺字行为需要逐平台视觉验收。来源说明不是原生脚注。状态／重置／主题切换丢弃编辑与历史；JSON 不是 PDF 输出。',
    },
  },
  variants: [
    {
      id: 'family',
      label: { 'en-US': 'Sans / serif / monospace / missing', 'zh-CN': '无衬线 / 衬线 / 等宽 / 缺失' },
      description: {
        'en-US':
          'Four explicit font stacks compare family changes and missing-primary fallback without downloading fonts.',
        'zh-CN': '四个显式字体栈比较字体族变化和缺失首选字体回退，不下载字体文件。',
      },
    },
    {
      id: 'appearance',
      label: { 'en-US': 'Size and weight', 'zh-CN': '字号与粗细' },
      description: {
        'en-US': 'Regular/bold and 8–32 pt patch actual text runs; larger type can create additional physical pages.',
        'zh-CN': '常规／粗体和 8 至 32 点修改真实文字段；更大字号可能增加实际页数。',
      },
    },
    {
      id: 'scope',
      label: { 'en-US': 'Sample / whole report', 'zh-CN': '样本 / 整份报告' },
      description: {
        'en-US': 'Choose a unique marked sample or the complete main-body range, including headings and table text.',
        'zh-CN': '选择唯一标记样本或完整主正文范围，后者包含标题和表格文字。',
      },
    },
    {
      id: 'scripts',
      label: { 'en-US': 'Six script specimens', 'zh-CN': '六类文字样本' },
      description: {
        'en-US':
          'Inspect Latin, CJK, RTL, accents, symbols and U+10FFFD separately; nonzero metrics do not prove readable glyphs.',
        'zh-CN': '分别检查拉丁文、CJK、RTL、重音、符号及 U+10FFFD；非零度量不证明字形可读。',
      },
    },
  ],
  actions: [
    {
      id: 'view',
      label: { 'en-US': 'Fit width / 100%', 'zh-CN': '适合宽度 / 100%' },
      description: {
        'en-US':
          'View applies the native SetDocZoomRatioOperation through syncExecuteCommand, not CSS scaling. Fit responds to container resize; 100% retains native horizontal scrolling. Text point sizes and page geometry stay unchanged.',
        'zh-CN':
          'View 通过 syncExecuteCommand 执行原生 SetDocZoomRatioOperation，不使用 CSS 缩放。适合宽度随容器变化，100% 保留原生横向滚动；文字点数与页面尺寸不变。',
      },
    },
    {
      id: 'font',
      label: { 'en-US': 'Apply font family', 'zh-CN': '应用字体族' },
      description: {
        'en-US':
          'setTextStyle({ ff }) patches only the target family. An already-common family disables repeated application.',
        'zh-CN': 'setTextStyle({ ff }) 仅修改目标字体族，已有相同公共字体族时禁用重复应用。',
      },
    },
    {
      id: 'style',
      label: { 'en-US': 'Apply size and weight', 'zh-CN': '应用字号与粗细' },
      description: {
        'en-US': 'A single setTextStyle patch sets fs and bl. Invalid host sizes leave all document data unchanged.',
        'zh-CN': '一次 setTextStyle 修改 fs 和 bl；无效宿主字号保留全部文档数据。',
      },
    },
    {
      id: 'select',
      label: { 'en-US': 'Select sample', 'zh-CN': '选中样本' },
      description: {
        'en-US':
          'setSelection() selects the resolved sample in the native editor. Missing or duplicated markers disable selection.',
        'zh-CN': 'setSelection() 在原生编辑器中选中解析后的样本；缺失或重复标记时禁用选择。',
      },
    },
    {
      id: 'history',
      label: { 'en-US': 'Undo / Redo', 'zh-CN': '撤销 / 重做' },
      description: {
        'en-US':
          'Uses native document history. In beta.2, style Facades run inside the explicitly registered demo.command.alder-text-style command so the SDK records a history trigger; this is not a built-in font command or host snapshot history.',
        'zh-CN':
          '使用原生文档历史。beta.2 的样式 Facade 在显式注册的 demo.command.alder-text-style 命令内执行，为 SDK 提供历史触发标记；它不是内置字体命令，也不是宿主快照历史。',
      },
    },
    {
      id: 'invalid',
      label: { 'en-US': 'Try invalid range', 'zh-CN': '测试无效范围' },
      description: {
        'en-US':
          'A negative start offset exercises the real text-range guard and displays its error without changing the report.',
        'zh-CN': '负起始偏移触发真实文字范围校验，显示错误而不修改报告。',
      },
    },
    {
      id: 'snapshot',
      label: { 'en-US': 'Reload / download', 'zh-CN': '重载 / 下载' },
      description: {
        'en-US':
          'save() captures current styles and embedded resources. Reload recreates it; download stays local JSON.',
        'zh-CN': 'save() 保存当前样式和内嵌资源，重载重建文档；下载为本地 JSON。',
      },
    },
    {
      id: 'fixture',
      label: { 'en-US': 'States / Reset', 'zh-CN': '状态 / 重置' },
      description: {
        'en-US':
          'Loads cached fixtures and replaces edits/history. Reset restores the complete original typography report.',
        'zh-CN': '加载缓存状态并替换编辑／历史；重置恢复完整原始字体报告。',
      },
    },
  ],
  states: [
    {
      id: 'default',
      label: { 'en-US': 'Typography report', 'zh-CN': '字体报告' },
      description: {
        'en-US':
          'Original multilingual specimens with Arial/sans-serif, twelve chapter boundaries and reference resources.',
        'zh-CN': '原始多语言样本、Arial/sans-serif、十二个章节边界及参考资源。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Empty document', 'zh-CN': '空白文档' },
      description: {
        'en-US': 'A real empty native document has no sample targets; type text and use whole-report scope or Reset.',
        'zh-CN': '真实原生空白文档没有样本目标，可输入文字后使用整份报告范围，或重置。',
      },
    },
    {
      id: 'boundary',
      label: { 'en-US': 'Large sample type', 'zh-CN': '大字号样本' },
      description: {
        'en-US':
          'The Latin sample uses 32 pt bold, preserving other samples and revealing native wrapping differences.',
        'zh-CN': '拉丁文样本使用 32 点粗体，保留其他样本并展示原生换行差异。',
      },
    },
    {
      id: 'error',
      label: { 'en-US': 'Invalid range', 'zh-CN': '无效范围' },
      description: {
        'en-US': 'The original report remains intact after the installed Facade rejects a negative range start.',
        'zh-CN': '已安装 Facade 拒绝负范围起点后，原始报告仍保持完整。',
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
