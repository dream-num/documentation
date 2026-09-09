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
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createTransformGallery } from './data'

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
  root.className = 'pdf-transform-gallery'
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
  let startupAlert: HTMLElement | undefined
  const owner = window as Window & { univerAPI?: FUniver }
  function dispose() {
    startupAlert?.remove()
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
    const pdf = createTransformGallery(api)
    function initialize() {
      if (disposed) return
      try {
        if (
          api!.getCurrentLifecycleStage() < api!.Enum.LifecycleStages.Rendered ||
          !root.querySelector('[data-pdf-active-page-id] > canvas') ||
          root.querySelector('[data-u-comp="workbench-skeleton-content"]')
        ) {
          frame = requestAnimationFrame(initialize)
          return
        }
        root.dataset.ready = 'true'
      } catch (error) {
        let failure = error
        try {
          dispose()
        } catch (cleanupError) {
          // eslint-disable-next-line preserve-caught-error -- Preserve both errors with the original startup cause.
          failure = new AggregateError([error, cleanupError], 'PDF startup and cleanup failed', { cause: error })
        }
        startupAlert = document.createElement('p')
        startupAlert.setAttribute('role', 'alert')
        startupAlert.textContent = 'The native PDF text gallery could not initialize.'
        container.append(startupAlert)
        console.error(failure)
      }
    }
    frame = requestAnimationFrame(initialize)
    return { univerAPI: api, pdf, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Preserve both errors with the original startup cause.
      throw new AggregateError([error, cleanupError], 'PDF startup and cleanup failed', { cause: error })
    }
    throw error
  }
}
