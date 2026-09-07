import { readShowcaseFiles } from '@/showcase/read-files'

import Preview from './preview'

const metadata = {
  product: 'pdfs' as const,
  category: 'features' as const,
  group: { 'en-US': 'Document lifecycle', 'zh-CN': '文档生命周期' },
  title: { 'en-US': 'Create and Load a PDF Viewer', 'zh-CN': '创建与加载 PDF 查看器' },
  description: {
    'en-US':
      'Load a four-page supplier audit, edit its decision, dispose the viewer, and restore the saved SDK snapshot.',
    'zh-CN': '加载四页供应商审计包，编辑审阅结论，销毁查看器并恢复 SDK 快照。',
  },
  tags: { 'en-US': ['PDFs', 'Lifecycle', 'Snapshots'], 'zh-CN': ['PDF', '生命周期', '快照'] },
  packages: ['@univerjs/core', '@univerjs-pro/pdfs', '@univerjs-pro/pdfs-editor', '@univerjs-pro/pdfs-ui'],
  apis: [
    { name: 'FUniver.createPdf()' },
    { name: 'FPdf.save()' },
    { name: 'Univer.dispose()' },
    { name: 'FPdfTextBox.setText()' },
    { name: 'FPdfTextBox.getText()' },
    { name: 'FUniver.undo() / redo()' },
    { name: 'IPdfEditorRuntimeService.navigateToPage()' },
  ],
  guide: {
    overview: {
      'en-US':
        'Kestrel is an original fictional audit with four different pages: cover, findings table, embedded receiving schematic, and sign-off. Snapshot loading is separate from binary PDF import.',
      'zh-CN':
        'Kestrel 是原创虚构审计包，四页分别为封面、发现表、内嵌收货区示意图与签核页。加载快照与导入二进制 PDF 是不同能力。',
    },
    tryIt: {
      'en-US': [
        'Browse all four native page thumbnails. Expand Demo controls to use the lifecycle actions; collapse them for more editor space.',
        'Set review decision. The button disables when its text is already applied; Undo enables it again, and Redo restores the decision.',
        'Double-click the native sign-off text to type your own decision, then download the changed snapshot.',
        'Dispose viewer, then Remount saved snapshot. Check the decision and image remain.',
        'Reject invalid snapshot; the open document stays unchanged.',
        'Create a blank PDF: review and history actions are unavailable. Repeated blank loads restore the same cached blank snapshot. Then Reset.',
      ],
      'zh-CN': [
        '浏览四张原生页面缩略图；展开 Demo controls 使用生命周期操作，收起后为编辑器留出更多空间。',
        '设置审阅结论，相同结论已应用时按钮禁用；撤销后可再次设置，重做恢复结论。',
        '双击原生签核文字输入自定义结论，然后下载变更后的快照。',
        '销毁查看器并重新挂载保存的快照，确认结论与图片仍在。',
        '尝试无效快照，已打开的文档保持不变。',
        '新建空白 PDF，审阅和历史操作不可用；重复新建恢复同一份缓存空白快照，然后重置。',
      ],
    },
    expected: {
      'en-US':
        'Dispose saves this session in memory and removes the native editor. Remount recreates it in the same container from the saved snapshot, preserving content but not Undo, selection or viewport. Reset and theme changes restore the original packet. Missing-document validation happens before disposal; it is not general validation of arbitrary JSON. Downloads are SDK JSON, not .pdf files; Exchange handles binary import/export. No backend, upload, real audit findings or electronic signatures are involved. Trial watermarks remain.',
      'zh-CN':
        '销毁时把当前会话保存在内存中并移除原生编辑器；重新挂载在同一容器内恢复内容，不恢复撤销历史、选择或视口。重置及主题切换恢复原始审计包。缺失文档检查发生在销毁之前，并非任意 JSON 的通用校验器。下载为 SDK JSON 而非 .pdf，二进制导入导出由 Exchange 处理。不使用后端、不上传文件、不涉及真实审计结论或电子签名，试用水印仍在。',
    },
  },
  variants: [
    {
      id: 'packet',
      label: { 'en-US': 'Four-page supplier audit', 'zh-CN': '四页供应商审计包' },
      description: {
        'en-US':
          'Four distinct native pages include editable text, a findings table and an embedded original SVG; save() includes the image bytes.',
        'zh-CN': '四张不同原生页面包含可编辑文字、发现表及内嵌原创 SVG；save() 保留图片字节。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'One blank page', 'zh-CN': '单张空白页' },
      description: {
        'en-US':
          'createPdf() supplies one empty page. With no sign-off target, Set review decision is disabled; subsequent blank loads restore its cached snapshot.',
        'zh-CN': 'createPdf() 创建一张空白页；没有签核目标时禁用设置结论，后续新建空白恢复缓存快照。',
      },
    },
    {
      id: 'unmounted',
      label: { 'en-US': 'No viewer mounted', 'zh-CN': '未挂载查看器' },
      description: {
        'en-US':
          'The owning Univer instance and canvases are removed while the session snapshot remains in memory. Remount uses a new owner in the same container.',
        'zh-CN': '销毁所属 Univer 实例及 Canvas，当前会话快照保留在内存中；重新挂载在同一容器创建新实例。',
      },
    },
  ],
  actions: [
    {
      id: 'reset',
      label: { 'en-US': 'Load packet / Reset', 'zh-CN': '加载审计包 / 重置' },
      description: {
        'en-US':
          'Recreates all four pages from the original cached save() result, discarding current edits and history. The authored audit date stays fixed.',
        'zh-CN': '从原始缓存的 save() 结果重建全部四页，丢弃当前编辑及历史，案例审计日期固定不变。',
      },
    },
    {
      id: 'review',
      label: { 'en-US': 'Set review decision', 'zh-CN': '设置审阅结论' },
      description: {
        'en-US':
          'setText() changes the actual sign-off object, then the public runtime service navigates to it. Missing and already-applied targets disable this action; typed text is not an electronic signature.',
        'zh-CN':
          'setText() 修改实际签核对象，随后通过公共运行时服务定位；目标不存在或相同结论已应用时禁用。这只是文字，不是电子签名。',
      },
    },
    {
      id: 'history',
      label: { 'en-US': 'Undo / Redo', 'zh-CN': '撤销 / 重做' },
      description: {
        'en-US':
          'Calls the installed undo()/redo() Facades and reads live text again. Empty history disables its button. History is not persisted across remount, Reset or blank loading.',
        'zh-CN':
          '调用已安装的 undo()/redo() Facade 并重新读取实际文字；历史为空时禁用。重新挂载、重置和新建空白不保留历史。',
      },
    },
    {
      id: 'dispose',
      label: { 'en-US': 'Dispose viewer', 'zh-CN': '销毁查看器' },
      description: {
        'en-US':
          'Saves the current PDF before disposing the owning Univer. The host shows no open PDF; editor-only actions are unavailable.',
        'zh-CN': '先保存当前 PDF，再销毁所属 Univer；宿主显示未打开 PDF，仅适用于编辑器的操作不可用。',
      },
    },
    {
      id: 'remount',
      label: { 'en-US': 'Remount saved snapshot', 'zh-CN': '重新挂载快照' },
      description: {
        'en-US':
          'createPdf() loads the in-memory saved snapshot into a new owner. Text, tables and embedded image persist, but selection, viewport and Undo history do not.',
        'zh-CN': 'createPdf() 将内存快照加载到新实例；保留文字、表格和内嵌图片，不保留选择、视口及撤销历史。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'Create blank PDF', 'zh-CN': '新建空白 PDF' },
      description: {
        'en-US':
          'Replaces the open packet with a one-page empty PDF. This is a mounted editor, distinct from Dispose viewer, and overwrites current edits.',
        'zh-CN': '用单页空白 PDF 替换已打开审计包并覆盖当前编辑；编辑器仍挂载，与销毁查看器不同。',
      },
    },
    {
      id: 'invalid',
      label: { 'en-US': 'Reject invalid snapshot', 'zh-CN': '拒绝无效快照' },
      description: {
        'en-US':
          'The host rejects a missing-document snapshot before disposal. Current content, owner and history remain unchanged; this guard is not a complete arbitrary-file validator.',
        'zh-CN': '宿主在销毁前拒绝缺失 document 的快照，保留当前内容、实例及历史；该检查不是任意文件的完整校验器。',
      },
    },
    {
      id: 'download',
      label: { 'en-US': 'Download snapshot', 'zh-CN': '下载快照' },
      description: {
        'en-US':
          'Downloads the complete current save() result as JSON, including native edits and embedded image bytes. It sends nothing to a server and does not produce a binary PDF.',
        'zh-CN': '将完整当前 save() 结果下载为 JSON，包含原生编辑和内嵌图片字节；不上传服务器，也不生成二进制 PDF。',
      },
    },
  ],
  states: [
    {
      id: 'loaded',
      label: { 'en-US': 'Packet mounted', 'zh-CN': '审计包已挂载' },
      description: {
        'en-US':
          'Reset restores the original four-page packet and pending decision, with empty history. Readiness waits for the SDK Rendered lifecycle.',
        'zh-CN': '重置恢复原始四页审计包及待审结论，历史为空；就绪状态等待 SDK Rendered 生命周期。',
      },
    },
    {
      id: 'empty',
      label: { 'en-US': 'Viewer disposed', 'zh-CN': '查看器已销毁' },
      description: {
        'en-US':
          'No native workbench or canvas remains. Only the saved in-memory snapshot is retained for Remount; reopening the browser loses that session.',
        'zh-CN': '不保留原生工作区或 Canvas，仅在内存保留供重新挂载的快照；关闭浏览器后会话丢失。',
      },
    },
    {
      id: 'blank',
      label: { 'en-US': 'Blank page boundary', 'zh-CN': '空白页边界' },
      description: {
        'en-US':
          'One empty mounted page has no sign-off, table or image. Blank creation and remount are repeatable without adding new authored content.',
        'zh-CN': '挂载的一页空白没有签核、表格或图片；可重复新建或重新挂载，不增加案例内容。',
      },
    },
    {
      id: 'error',
      label: { 'en-US': 'Invalid load; content retained', 'zh-CN': '加载无效，保留内容' },
      description: {
        'en-US':
          'An explicit error is shown without changing the current snapshot or mount/disposal counts. Reset or a valid lifecycle action clears the error.',
        'zh-CN': '显示明确错误，不改变当前快照和挂载／销毁次数；重置或有效生命周期操作清除错误。',
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
