import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin, type ISlideData } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { SLIDE_DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/slides/facade'
import '@univerjs/ui/facade'

export function validateSnapshot(data: ISlideData) {
  // Restore this demo's SDK snapshots, not arbitrary file formats.
  if (
    !data.id ||
    !Array.isArray(data.slideOrder) ||
    new Set(data.slideOrder).size !== data.slideOrder.length ||
    !data.slides ||
    !data.slideOrder.every((id) => {
      const page = data.slides[id]
      return (
        page?.id === id &&
        Array.isArray(page.elementOrder) &&
        page.elementOrder.every((key) => page.elements?.[key]?.id === key)
      )
    }) ||
    (data.slideOrder.length > 0 && Boolean(data.activeSlideId) && !data.slideOrder.includes(data.activeSlideId!)) ||
    ![data.defaultPageSize?.width, data.defaultPageSize?.height].every(
      (n) => typeof n === 'number' && Number.isFinite(n) && n > 0,
    )
  )
    throw new Error('Restore a Slides snapshot with valid page identities and positive default dimensions.')
}

export function createSlidesDemo(
  container: HTMLElement,
  darkMode = false,
  _locale: LocaleType = LocaleType.EN_US,
  saved?: ISlideData,
) {
  const data = structuredClone(saved ?? structuredClone(SLIDE_DATA))
  validateSnapshot(data)
  const root = document.createElement('div')
  root.className = 'slides-basic-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        ShapeEditorUIEnUS,
        SlidesUIEnUS,
        // Demo-only product names; preserve every other official English translation.
        {
          'shape-editor-ui': {
            ...ShapeEditorUIEnUS['shape-editor-ui'],
            formulaBinding: {
              ...ShapeEditorUIEnUS['shape-editor-ui']['formulaBinding'],
              baseUnit: 'Relational Tables',
            },
            formulaShape: { ...ShapeEditorUIEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
        },
      ),
    },
  })
  let disposed = false
  let api: FUniver
  let lifecycle: { dispose(): void } | undefined
  let readyFrame = 0
  let readyTimeout: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  const demoWindow = window as Window & { univerAPI?: FUniver }
  function showStartupError(error: unknown) {
    root.dataset.error = String(error)
    const message = document.createElement('p')
    message.setAttribute('role', 'alert')
    message.textContent = 'The Slides slides could not start. Reload to retry; details are in the console.'
    root.prepend(message)
  }
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle?.dispose()
    cancelAnimationFrame(readyFrame)
    clearTimeout(readyTimeout)
    finish()
    const errors: unknown[] = []
    for (const release of [() => unmount(root), () => api?.disposeUnit(data.id), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Slides cleanup failed')
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let fitted = Boolean(saved)
    function waitForCanvas() {
      if (disposed || root.dataset.error) return
      const canvas = root.querySelector<HTMLCanvasElement>('[data-slide-canvas-host] canvas')
      const deck = api.getPresentation(data.id)
      const empty = deck != null && deck.save().slideOrder.length === 0
      if (
        (empty || (canvas && canvas.width > 0 && canvas.height > 0)) &&
        !root.querySelector('[data-u-comp="workbench-skeleton-content"]')
      ) {
        if (!fitted && canvas && deck?.getActiveSlide()) {
          fitted = true
          const size = deck.getActiveSlide()!.getPageSize(),
            box = canvas.getBoundingClientRect()
          api.syncExecuteCommand('slide.operation.set-zoom-ratio', {
            unitId: data.id,
            zoomRatio: Math.min(
              1,
              Math.max(1, box.width - 40) / size.width,
              Math.max(1, box.height - 40) / size.height,
            ),
          })
          readyFrame = requestAnimationFrame(waitForCanvas)
          return
        }
        clearTimeout(readyTimeout)
        root.dataset.ready = 'true'
        finish()
      } else readyFrame = requestAnimationFrame(waitForCanvas)
    }
    lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === api.Enum.LifecycleStages.Rendered && !disposed) readyFrame = requestAnimationFrame(waitForCanvas)
    })
    readyTimeout = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(readyFrame)
      const error = new Error('Slides native canvas did not become ready within 20 seconds.')
      showStartupError(error)
      console.error(error)
      finish()
    }, 20000)
    api.createPresentation(data)
    return { univerAPI: api, ready, dispose }
  } catch (error) {
    dispose()
    root.replaceChildren()
    container.append(root)
    showStartupError(error)
    throw error
  }
}
