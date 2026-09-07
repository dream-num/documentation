import { BooleanNumber, type IDocumentData } from '@univerjs/core'
import { unmount } from '@univerjs/design'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import docsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { AGREEMENT } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function validateSnapshot(data: IDocumentData) {
  if (
    data.id !== 'services-agreement-v3-2' ||
    !data.body?.dataStream?.endsWith('\r\n') ||
    !Array.isArray(data.body.paragraphs) ||
    ![data.documentStyle?.pageSize?.width, data.documentStyle?.pageSize?.height].every(
      (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    )
  )
    throw new Error(
      'Restore a complete services-agreement-v3-2 snapshot with its original identity and positive page dimensions',
    )
}

export function createServicesAgreementDemo(
  container: HTMLElement,
  darkMode = false,
  locale = globalThis.document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: IDocumentData,
) {
  if (saved) validateSnapshot(saved)
  const root = globalThis.document.createElement('div')
  root.className = 'services-agreement-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: mergeLocales(docsCoreEnUS), [LocaleType.ZH_CN]: mergeLocales(docsCoreZhCN) },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false,
    frame = 0
  let timeout: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function waitForCanvas() {
    if (disposed) return
    const canvas = root.querySelector<HTMLCanvasElement>('#univer-doc-main-canvas')
    if (canvas?.width && canvas.height && !root.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
      root.dataset.ready = 'true'
      clearTimeout(timeout)
      finish()
    } else frame = requestAnimationFrame(waitForCanvas)
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === univerAPI.Enum.LifecycleStages.Rendered) frame = requestAnimationFrame(waitForCanvas)
  })
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    cancelAnimationFrame(frame)
    clearTimeout(timeout)
    finish()
    const errors: unknown[] = []
    for (const release of [
      () => unmount(root),
      () => univerAPI.disposeUnit('services-agreement-v3-2'),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Services agreement cleanup failed')
  }
  timeout = setTimeout(() => {
    if (disposed) return
    cancelAnimationFrame(frame)
    root.dataset.ready = 'error'
    const alert = globalThis.document.createElement('p')
    alert.role = 'alert'
    alert.textContent =
      locale === LocaleType.ZH_CN ? '协议未能启动，请重新加载。' : 'The agreement could not start. Reload to retry.'
    root.prepend(alert)
    console.error(new Error('Services agreement native canvas startup timed out'))
    finish()
  }, 20000)
  try {
    if (saved) univerAPI.createDocument(structuredClone(saved))
    else {
      const document = univerAPI.createDocument({
        id: 'services-agreement-v3-2',
        title: AGREEMENT.title,
        documentStyle: {
          documentFlavor: univerAPI.Enum.DocumentFlavor.TRADITIONAL,
          pageSize: { width: 794, height: 1123 },
          marginTop: 72,
          marginRight: 78,
          marginBottom: 72,
          marginLeft: 78,
        },
      })

      const footerId = document.ensurePageFooter()
      document.appendParagraph('SERVICES AGREEMENT · VERSION 3.2', footerId).setStyle({
        textStyle: { fs: 8, cl: { rgb: '#667085' } },
      })
      document.getParagraphs()[0]?.setText(AGREEMENT.title)
      document.getParagraphs()[0]?.setStyle({
        textStyle: { bl: BooleanNumber.TRUE, fs: 20, ff: 'Times New Roman' },
        spaceBelow: { v: 12 },
      })
      document.appendParagraph(AGREEMENT.parties).setStyle({
        textStyle: { fs: 10.5, it: BooleanNumber.TRUE, ff: 'Times New Roman', cl: { rgb: '#475467' } },
        spaceBelow: { v: 18 },
      })

      AGREEMENT.clauses.forEach(([heading, body]) => appendClause(document, heading, body))
      const limitationHeading = document.appendParagraph(AGREEMENT.limitationBefore[0])
      limitationHeading.setStyle(clauseHeadingStyle())
      const limitationBody = document.appendParagraph(AGREEMENT.limitationBefore[1])
      limitationBody.setStyle(clauseBodyStyle())
      const approval = document.appendParagraph(AGREEMENT.referenceBefore)
      approval.setStyle({
        textStyle: { bl: BooleanNumber.TRUE, fs: 10.5, ff: 'Times New Roman', cl: { rgb: '#B54708' } },
        spaceBelow: { v: 12 },
      })
      document.appendParagraph('16. Signatures').setStyle({
        pageBreakBefore: BooleanNumber.TRUE,
        keepNext: BooleanNumber.TRUE,
        textStyle: { bl: BooleanNumber.TRUE, fs: 12, ff: 'Times New Roman' },
      })
      document
        .appendParagraph(
          'Provider: ____________________    Customer: ____________________\nDate: ________________________    Date: ________________________',
        )
        .setStyle({
          keepLines: BooleanNumber.TRUE,
          textStyle: { fs: 10.5, ff: 'Times New Roman' },
        })
    }
  } catch (error) {
    dispose()
    throw error
  }
  return { univerAPI, ready, dispose }
}

function appendClause(
  document: ReturnType<ReturnType<typeof createUniver>['univerAPI']['createDocument']>,
  heading: string,
  body: string,
) {
  document.appendParagraph(heading).setStyle(clauseHeadingStyle())
  document.appendParagraph(body).setStyle(clauseBodyStyle())
}

function clauseHeadingStyle() {
  return {
    keepNext: BooleanNumber.TRUE,
    textStyle: { bl: BooleanNumber.TRUE, fs: 11, ff: 'Times New Roman' },
    spaceAbove: { v: 5 },
  }
}

function clauseBodyStyle() {
  return {
    widowControl: BooleanNumber.TRUE,
    textStyle: { fs: 10, ff: 'Times New Roman', cl: { rgb: '#344054' } },
    lineSpacing: 1.08,
    spaceBelow: { v: 7 },
  }
}
