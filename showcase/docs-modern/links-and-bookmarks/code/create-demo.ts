/* eslint-disable no-control-regex -- Reject control characters at the host URL boundary. */
import type { IDocumentData } from '@univerjs/core'
import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { UniverDocsCalloutUIPlugin } from '@univerjs-pro/docs-callout-ui'
import CalloutEnUS from '@univerjs-pro/docs-callout-ui/locale/en-US'
import CalloutZhCN from '@univerjs-pro/docs-callout-ui/locale/zh-CN'
import { UniverDocsCodePlugin } from '@univerjs-pro/docs-code'
import { UniverDocsCodeUIPlugin } from '@univerjs-pro/docs-code-ui'
import CodeEnUS from '@univerjs-pro/docs-code-ui/locale/en-US'
import CodeZhCN from '@univerjs-pro/docs-code-ui/locale/zh-CN'
import { UniverDocsListPlugin } from '@univerjs-pro/docs-list'
import { UniverDocsListUIPlugin } from '@univerjs-pro/docs-list-ui'
import ListEnUS from '@univerjs-pro/docs-list-ui/locale/en-US'
import ListZhCN from '@univerjs-pro/docs-list-ui/locale/zh-CN'
import { UniverDocsQuotePlugin } from '@univerjs-pro/docs-quote'
import { UniverDocsQuoteUIPlugin } from '@univerjs-pro/docs-quote-ui'
import QuoteEnUS from '@univerjs-pro/docs-quote-ui/locale/en-US'
import QuoteZhCN from '@univerjs-pro/docs-quote-ui/locale/zh-CN'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { CustomRangeType, IUndoRedoService, IUniverInstanceService, PresetListType } from '@univerjs/core'
import { addCustomRangeBySelectionFactory, DocSelectionManagerService } from '@univerjs/docs'
import { DocBackScrollRenderController, SetDocZoomRatioOperation } from '@univerjs/docs-ui'
import { IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link'
import HyperLinkEnUS from '@univerjs/preset-docs-hyper-link/locales/en-US'
import HyperLinkZhCN from '@univerjs/preset-docs-hyper-link/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { BOOKMARKS, createData, LINKS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-hyper-link/lib/index.css'
import '@univerjs-pro/docs-callout-ui/lib/index.css'
import '@univerjs-pro/docs-code-ui/lib/index.css'
import '@univerjs-pro/docs-list-ui/lib/index.css'
import '@univerjs-pro/docs-quote-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-callout/facade'
import '@univerjs-pro/docs-code/facade'
import '@univerjs-pro/docs-list/facade'
import '@univerjs-pro/docs-quote/facade'

export function validateAddress(value: string) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('Invalid address')
  if (/^#bookmark=[a-z0-9-]+$/.test(value)) return value
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('Only credential-free HTTP(S) or #bookmark= IDs are allowed')
  return value
}
export function createDemo(container: HTMLElement, darkMode = false, saved?: IDocumentData) {
  if (
    saved !== undefined &&
    (saved?.id !== 'atlas-links-demo' ||
      !saved.body?.dataStream?.endsWith('\r\n') ||
      !Array.isArray(saved.body.paragraphs))
  )
    throw new Error('Restore an Atlas document with its original ID, body and paragraphs')
  const chinese = document.documentElement.lang === 'zh-CN'
  const root = document.createElement('div')
  root.className = 'links-demo'
  root.dataset.ready = 'false'
  const navigation = document.createElement('div')
  navigation.className = 'links-navigation'
  const open = document.createElement('button')
  open.type = 'button'
  open.textContent = chinese ? '打开所选链接（宿主）' : 'Open selected link (host)'
  open.disabled = true
  const error = document.createElement('p')
  error.role = 'alert'
  error.hidden = true
  const editor = document.createElement('div')
  editor.className = 'links-editor'
  navigation.append(open)
  root.append(navigation, error, editor)
  container.append(root)
  let disposed = false
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: chinese ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, HyperLinkEnUS, CalloutEnUS, CodeEnUS, ListEnUS, QuoteEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DocsZhCN, HyperLinkZhCN, CalloutZhCN, CodeZhCN, ListZhCN, QuoteZhCN),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: editor }), UniverDocsHyperLinkPreset()],
    plugins: [
      UniverLicensePlugin,
      UniverDocsCalloutPlugin,
      UniverDocsCalloutUIPlugin,
      UniverDocsCodePlugin,
      UniverDocsCodeUIPlugin,
      UniverDocsListPlugin,
      UniverDocsListUIPlugin,
      UniverDocsQuotePlugin,
      UniverDocsQuoteUIPlugin,
    ],
  })
  const injector = univer.__getInjector()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const current = () => {
    if (disposed) throw new Error('Atlas owner is disposed')
    const doc = univerAPI.getActiveDocument()
    if (doc?.getId() !== 'atlas-links-demo') throw new Error('Atlas document is missing')
    return doc
  }
  const paragraph = (marker: string) => {
    const matches = current()
      .getParagraphs()
      .filter((p) => p.getText().includes(marker))
    if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
    return matches[0]
  }
  function navigate(address: string) {
    const doc = current()
    const url = validateAddress(address)
    if (!url.startsWith('#bookmark=')) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    const id = url.slice('#bookmark='.length)
    const target = doc
      .save()
      .body?.customRanges?.find((range) => range.rangeType === CustomRangeType.BOOKMARK && range.rangeId === id)
    if (!target) throw new Error('Missing bookmark: ' + id)
    injector.get(IUniverInstanceService).focusUnit(doc.getId())
    doc.setSelection(target.startIndex, target.endIndex + 1)
    injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocBackScrollRenderController)
      .scrollToRange({ startOffset: target.startIndex, endOffset: target.startIndex, collapsed: true })
  }
  const openSelected = () => {
    try {
      const selection = injector.get(DocSelectionManagerService).getActiveTextRange()
      const target = current()
        .save()
        .body?.customRanges?.find(
          (range) =>
            range.rangeType === CustomRangeType.HYPERLINK &&
            selection &&
            selection.startOffset >= range.startIndex &&
            selection.startOffset <= range.endIndex + 1,
        )
      if (!target)
        throw new Error(chinese ? '请先在原生文档中选择链接文字。' : 'Select link text in the native document first.')
      navigate(target.properties?.url ?? '')
      error.hidden = true
    } catch (cause) {
      error.textContent =
        (chinese ? '导航已阻止：' : 'Navigation blocked: ') + (cause instanceof Error ? cause.message : String(cause))
      error.hidden = false
    }
  }
  open.addEventListener('click', openSelected)
  function fitWidth() {
    if (disposed || root.dataset.ready !== 'true') return
    const doc = current()
    const width = injector.get(IRenderManagerService).getRenderUnitById(doc.getId())?.mainComponent?.width
    if (!width) return
    const zoomRatio = Math.min(1, Math.max(0.1, (editor.clientWidth - 24) / (width + 80)))
    if (Math.abs((doc.save().settings?.zoomRatio ?? 1) - zoomRatio) > 0.001)
      univerAPI.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: doc.getId(), zoomRatio })
  }
  const resize = new ResizeObserver(fitWidth)
  resize.observe(editor)
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage >= univerAPI.Enum.LifecycleStages.Rendered) {
      root.dataset.ready = 'true'
      open.disabled = false
      fitWidth()
    }
  })
  const doc = univerAPI.createDocument(structuredClone(saved ?? createData()))
  if (!saved) {
    for (const link of LINKS) {
      const range = paragraph(link.marker).getRange()
      const mutation = addCustomRangeBySelectionFactory(injector, {
        unitId: doc.getId(),
        rangeId: link.id,
        rangeType: CustomRangeType.HYPERLINK,
        properties: { url: link.url },
        selections: [
          {
            startOffset: range.startOffset + link.marker.length,
            endOffset: range.endOffset,
            collapsed: false,
            segmentId: '',
          },
        ],
      })
      if (!mutation || !univerAPI.syncExecuteCommand(mutation.id, mutation.params))
        throw new Error('Could not create original link')
    }
    const bookmark = BOOKMARKS[0]
    const mutation = addCustomRangeBySelectionFactory(injector, {
      unitId: doc.getId(),
      rangeId: bookmark.id,
      rangeType: CustomRangeType.BOOKMARK,
      properties: { name: bookmark.heading },
      selections: [{ ...paragraph(bookmark.heading).getRange(), collapsed: false, segmentId: '' }],
    })
    if (!mutation || !univerAPI.syncExecuteCommand(mutation.id, mutation.params))
      throw new Error('Could not create original bookmark')
    if (
      !doc.insertCallout(paragraph('[CAUTION]'), {
        blockId: 'atlas-caution',
        config: { icon: '!', backgroundColor: '#FEF0C7' },
      }) ||
      !doc.insertQuote(paragraph('[QUOTE]'), { blockId: 'atlas-perspective' }) ||
      !doc.insertCode(paragraph('const reminder'), { blockId: 'atlas-code', config: { language: 'typescript' } })
    )
      throw new Error('Could not create original blocks')
    for (const [first, last, listId, listType] of [
      ['Photograph the', 'Record the agreed', 'atlas-checkout', PresetListType.BULLET_LIST],
      ['Confirm the torque', 'Check that the borrower', 'atlas-tasks', PresetListType.CHECK_LIST],
    ] as const)
      if (
        !doc.insertList({
          startOffset: paragraph(first).getRange().startOffset,
          endOffset: paragraph(last).getRange().endOffset,
          listId,
          listType,
        })
      )
        throw new Error('Could not create original list')
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  return {
    univer,
    univerAPI,
    navigate,
    dispose() {
      if (disposed) return
      disposed = true
      resize.disconnect()
      open.removeEventListener('click', openSelected)
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
