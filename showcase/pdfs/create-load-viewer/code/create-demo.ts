import type { IPdfUnitData } from '@univerjs-pro/pdfs'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { IPdfEditorRuntimeService, UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
import { IUndoRedoService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { BuiltInUIPart, UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createAuditPacket, REVIEWED_SIGNOFF } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/pdfs-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/pdfs/facade'
import '@univerjs/ui/facade'

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'pdf-lifecycle'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML =
    '<details class="lifecycle-controls"><summary>Demo controls / Viewer lifecycle</summary><fieldset disabled><legend>Viewer lifecycle</legend><button data-action="reset">Load audit packet / Reset</button><button data-action="blank">New blank PDF</button><button data-action="review">Set review decision</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="dispose">Dispose viewer</button><button data-action="remount">Remount saved snapshot</button><button data-action="invalid">Reject invalid snapshot</button><button data-action="download">Download snapshot</button></fieldset><p class="hint">Decision uses setText(); an absent or already-applied decision disables the action. Undo/Redo use SDK history. Readback updates automatically. Dispose saves this session in memory; Remount restores edits, not Undo or viewport state. Reset, blank PDF and editor theme changes replace current edits. Download first. JSON snapshots only; binary PDF import/export requires Exchange.</p></details><p role="status">Loading audit packet…</p><p role="alert" hidden></p><details><summary>Live SDK state</summary><pre><output aria-label="PDF lifecycle readback"></output></pre></details><div class="pdf-viewer"></div>'
  container.append(root)
  const viewer = root.querySelector<HTMLElement>('.pdf-viewer')!
  const controls = root.querySelector('fieldset')!
  const status = root.querySelector('[role=status]')!
  const alert = root.querySelector<HTMLElement>('[role=alert]')!
  const output = root.querySelector('output')!
  const events = new AbortController()
  let current: ReturnType<typeof initialize> | undefined
  let original: IPdfUnitData | undefined
  let blankSnapshot: IPdfUnitData | undefined
  let saved: IPdfUnitData | undefined
  let disposed = false,
    busy = false,
    mounts = 0,
    disposals = 0
  let scheduled = 0
  let disposedRuntimeAttached: boolean | null = null
  const resize = new ResizeObserver(() => {
    void fit()
  })
  resize.observe(viewer)

  async function fit() {
    const owner = current
    if (!owner || disposed) return
    owner.api.setUIVisible(BuiltInUIPart.LEFT_SIDEBAR, root.clientWidth >= 800)
    await paint()
    if (current !== owner || disposed) return
    const area = viewer.querySelector<HTMLElement>('[data-pdf-scroll-container]')
    const page = owner.pdf.getPageByIndex(0)?.getData()
    if (!area || !page) return
    if (!owner.runtime.getState(owner.pdf.getId())?.ephemeral.viewport?.activePageId)
      owner.runtime.navigateToPage(owner.pdf.getId(), page.id)
    owner.runtime.updateViewport(owner.pdf.getId(), {
      zoom: Math.max(
        0.1,
        Math.min(
          1,
          (area.clientWidth - 48) / (page.size.width / 9525),
          (area.clientHeight - 48) / (page.size.height / 9525),
        ),
      ),
    })
  }

  function inspect() {
    if (disposed) return
    const pdf = current?.pdf
    const pages = pdf?.getPages() ?? []
    const viewport = current?.runtime.getState(pdf!.getId())?.ephemeral.viewport
    const decision = pdf
      ?.getPageByIndex(3)
      ?.getTextBoxes()
      .find((item) => item.getId() === 'signoff')
    status.textContent = pdf
      ? `${pages.length} pages · mounted · ${pdf.getName()}`
      : 'No PDF open · saved snapshot available for remount'
    output.textContent = JSON.stringify(
      {
        mounted: !!pdf,
        mounts,
        disposals,
        disposedRuntimeAttached,
        unitId: pdf?.getId() ?? null,
        pageCount: pages.length,
        activePageId: viewport?.activePageId ?? null,
        pages: pages.map((page) => ({
          id: page.getId(),
          text: page.getTextBoxes().map((item) => ({ id: item.getId(), text: item.getText() })),
          images: page.getImages().length,
          tables: page.getTables().length,
        })),
        snapshot: pdf?.save() ?? saved,
      },
      null,
      2,
    )
    for (const button of controls.querySelectorAll('button')) {
      button.disabled =
        busy ||
        (['dispose', 'review', 'download'].includes(button.dataset.action!) && !pdf) ||
        (button.dataset.action === 'review' && (!decision || decision.getText() === REVIEWED_SIGNOFF)) ||
        (button.dataset.action === 'undo' && !current?.history.pitchTopUndoElement()) ||
        (button.dataset.action === 'redo' && !current?.history.pitchTopRedoElement()) ||
        (button.dataset.action === 'remount' && (!!pdf || !saved))
    }
  }
  function initialize(data?: IPdfUnitData, blank = false) {
    const univer = new Univer({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, PdfsUIEnUS) },
    })
    try {
      univer.registerPlugin(UniverRenderEnginePlugin)
      univer.registerPlugin(UniverUIPlugin, { container: viewer, ribbonType: 'grid' })
      univer.registerPlugin(UniverDocsPlugin)
      univer.registerPlugin(UniverDocsUIPlugin)
      univer.registerPlugin(UniverDrawingPlugin)
      univer.registerPlugin(UniverDrawingUIPlugin)
      univer.registerPlugin(UniverLicensePlugin)
      univer.registerPlugin(UniverPdfsPlugin)
      univer.registerPlugin(UniverPdfEditorPlugin)
      univer.registerPlugin(UniverPdfsUIPlugin)
      const api = FUniver.newAPI(univer)
      const pdf = data
        ? api.createPdf(structuredClone(data))
        : blank
          ? api.createPdf({ id: 'audit-blank', name: 'Blank audit working page' })
          : createAuditPacket(api)
      const history = univer.__getInjector().get(IUndoRedoService)
      history.clearUndoRedo(pdf.getId())
      const runtime = univer.__getInjector().get(IPdfEditorRuntimeService)
      const subscription = runtime.changed$.subscribe(() => {
        cancelAnimationFrame(scheduled)
        scheduled = requestAnimationFrame(inspect)
      })
      mounts++
      return { univer, api, pdf, runtime, history, subscription }
    } catch (cause) {
      univer.dispose()
      throw cause
    }
  }
  async function unmount() {
    if (!current) return
    saved = current.pdf.save()
    const previous = current
    current = undefined
    previous.subscription.unsubscribe()
    previous.univer.dispose()
    disposedRuntimeAttached = previous.runtime.getState(previous.pdf.getId()) !== undefined
    disposals++
    await paint()
    if (disposed) return
    viewer.replaceChildren()
    viewer.textContent = 'No PDF open. Remount the saved snapshot, load the audit packet, or create a blank PDF.'
  }
  async function mount(data?: IPdfUnitData, blank = false) {
    // Validate the supported load boundary before disposing the current unit.
    // This is not a general validator for arbitrary untrusted JSON or PDF bytes.
    if (data && (!data.document || !Array.isArray(data.document.pages)))
      throw new Error('Snapshot has no document. The current viewer and edits are unchanged.')
    await unmount()
    if (disposed) return
    viewer.replaceChildren()
    const owner = (current = initialize(data ?? (blank ? blankSnapshot : undefined), blank))
    /* eslint-disable no-unmodified-loop-condition, no-await-in-loop -- Owner teardown can happen between SDK lifecycle frames. */
    while (
      !disposed &&
      current === owner &&
      owner.api.getCurrentLifecycleStage() < owner.api.Enum.LifecycleStages.Rendered
    )
      await paint()
    /* eslint-enable no-unmodified-loop-condition, no-await-in-loop */
    if (disposed || current !== owner) return
    await fit()
    if (disposed || current !== owner) return
    if (blank) blankSnapshot ??= owner.pdf.save()
    else original ??= owner.pdf.save()
  }
  async function run(action: () => Promise<void> | void) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    root.dataset.ready = 'false'
    alert.hidden = true
    try {
      await action()
    } catch (cause) {
      alert.textContent = cause instanceof Error ? cause.message : String(cause)
      alert.hidden = false
    } finally {
      busy = false
      if (!disposed) {
        controls.disabled = false
        root.dataset.ready = 'true'
        inspect()
      }
    }
  }
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(async () => {
        if (action === 'reset') return mount(original)
        if (action === 'blank') return mount(undefined, true)
        if (action === 'dispose') return unmount()
        if (action === 'remount') return mount(saved)
        if (action === 'undo') return void (await current!.api.undo())
        if (action === 'redo') return void (await current!.api.redo())
        if (action === 'invalid') {
          return mount({ ...original, document: null } as unknown as IPdfUnitData)
        }
        if (action === 'review') {
          const page = current?.pdf.getPageByIndex(3)
          const decision = page?.getTextBoxes().find((item) => item.getId() === 'signoff')
          if (!decision) throw new Error('This document has no sign-off page. Load the audit packet first.')
          if (decision.getText() === REVIEWED_SIGNOFF) return
          decision.setText(REVIEWED_SIGNOFF)
          current!.runtime.navigateToPage(current!.pdf.getId(), page!.getId())
        }
        if (action === 'download') {
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(current!.pdf.save(), null, 2)], { type: 'application/json' }),
          )
          const link = document.createElement('a')
          link.href = url
          link.download = 'kestrel-audit-snapshot.json'
          link.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
        await paint()
      })
    },
    { signal: events.signal },
  )
  void run(() => mount())
  return {
    dispose() {
      disposed = true
      events.abort()
      cancelAnimationFrame(scheduled)
      resize.disconnect()
      current?.subscription.unsubscribe()
      current?.univer.dispose()
      current = undefined
      root.remove()
    },
  }
}
