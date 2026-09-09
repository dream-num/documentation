import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { IPdfEditorRuntimeService, UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
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

import { createNavigationGallery } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/pdfs-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/pdfs/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'pdf-navigation-gallery'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, PdfsUIEnUS),
    },
  })
  let frame = 0,
    disposed = false
  let api: FUniver | undefined
  const owner = window as Window & { univerAPI?: FUniver }
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    if (owner.univerAPI === api) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverPdfsPlugin)
    univer.registerPlugin(UniverPdfEditorPlugin)
    univer.registerPlugin(UniverPdfsUIPlugin)
    api = FUniver.newAPI(univer)
    owner.univerAPI = api
    const pdf = createNavigationGallery(api)
    const runtime = univer.__getInjector().get(IPdfEditorRuntimeService)
    function initialize() {
      if (disposed) return
      if (
        api!.getCurrentLifecycleStage() < api!.Enum.LifecycleStages.Rendered ||
        !root.querySelector('[data-pdf-scroll-container]')
      ) {
        frame = requestAnimationFrame(initialize)
        return
      }
      api!.setUIVisible(BuiltInUIPart.LEFT_SIDEBAR, root.clientWidth >= 800)
      const area = root.querySelector<HTMLElement>('[data-pdf-scroll-container]')!
      const page = pdf.getPageByIndex(0)!.getData()
      runtime.navigateToPage(pdf.getId(), page.id)
      runtime.updateViewport(pdf.getId(), {
        zoom: Math.max(
          0.1,
          Math.min(
            1,
            (area.clientWidth - 48) / (page.size.width / 9525),
            (area.clientHeight - 48) / (page.size.height / 9525),
          ),
        ),
      })
      root.dataset.ready = 'true'
    }
    frame = requestAnimationFrame(initialize)
    return { univerAPI: api, pdf, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'PDF navigation startup and cleanup failed', { cause: cleanup })
    }
    throw error
  }
}
