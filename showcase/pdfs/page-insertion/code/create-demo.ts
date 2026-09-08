import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
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

import { createPageGallery } from './data'

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
  root.className = 'pdf-page-insertion'
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
    const pdf = createPageGallery(api)
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
      root.dataset.ready = 'true'
    }
    frame = requestAnimationFrame(initialize)
    return { univerAPI: api, pdf, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanup) {
      // eslint-disable-next-line preserve-caught-error -- Both startup and cleanup errors are retained.
      throw new AggregateError([error, cleanup], 'PDF page insertion startup and cleanup failed', { cause: error })
    }
    throw error
  }
}
