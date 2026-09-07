import { UniverExchangeClientPlugin } from '@univerjs-pro/exchange-client'
import ExchangeEnUS from '@univerjs-pro/exchange-client/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { SetSlideZoomRatioOperation, UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesExchangeClientPlugin } from '@univerjs-pro/slides-exchange-client'
import SlidesExchangeEnUS from '@univerjs-pro/slides-exchange-client/locale/en-US'
import { UniverSlidesPrintPlugin } from '@univerjs-pro/slides-print'
import SlidesPrintEnUS from '@univerjs-pro/slides-print/locale/en-US'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { BuiltInUIPart, UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/exchange-client/lib/index.css'
import '@univerjs-pro/slides-print/lib/index.css'
import './styles.css'

import '@univerjs-pro/slides/facade'
import '@univerjs-pro/exchange-client/facade'
import '@univerjs-pro/slides-exchange-client/facade'
import '@univerjs-pro/slides-print/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'slide-theme-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
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
        ExchangeEnUS,
        SlidesExchangeEnUS,
        SlidesPrintEnUS,
      ),
    },
  })
  const cleanup: Array<() => void> = []
  let disposed = false
  let frame = 0
  const demoWindow = window as Window & { univer?: Univer; univerAPI?: FUniver }
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    root.remove()
    try {
      for (const release of cleanup.toReversed()) release()
    } finally {
      if (demoWindow.univer === univer) {
        delete demoWindow.univer
        delete demoWindow.univerAPI
      }
      univer.dispose()
    }
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid', header: true, toolbar: true })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverExchangeClientPlugin)
    univer.registerPlugin(UniverSlidesExchangeClientPlugin)
    univer.registerPlugin(UniverSlidesPrintPlugin)
    const api = FUniver.newAPI(univer)
    // Match the advanced SDK example: the console exposes real Facades, not a second toolbar.
    demoWindow.univer = univer
    demoWindow.univerAPI = api
    const fit = () => {
      if (disposed) return
      cancelAnimationFrame(frame)
      api.setUIVisible(BuiltInUIPart.LEFT_SIDEBAR, root.clientWidth >= 800)
      frame = requestAnimationFrame(() => {
        // Let the native sidebar layout and render engine resize before measuring the canvas.
        frame = requestAnimationFrame(() => {
          if (disposed) return
          const presentation = api.getActivePresentation()
          const active = presentation?.getActiveSlide()
          if (!presentation || !active) return
          const current = univer.__getInjector().get(IRenderManagerService).getRenderUnitById(presentation.getId())
          if (!current) return
          const size = active.getPageSize()
          api.syncExecuteCommand(SetSlideZoomRatioOperation.id, {
            unitId: presentation.getId(),
            zoomRatio: Math.min(
              1,
              Math.max(1, current.engine.width - 40) / size.width,
              Math.max(1, current.engine.height - 40) / size.height,
            ),
          })
        })
      })
    }
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Rendered) return
      const presentation = api.getActivePresentation()
      if (presentation) univer.__getInjector().get(IUniverInstanceService).focusUnit(presentation.getId())
      root.dataset.ready = 'true'
      fit()
    })
    cleanup.push(() => lifecycle.dispose())
    api.createPresentation(createData('overrides'))
    const resize = new ResizeObserver(fit)
    cleanup.push(() => resize.disconnect())
    resize.observe(root)
    return { univerAPI: api, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
