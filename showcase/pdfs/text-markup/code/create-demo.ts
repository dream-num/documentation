import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { IPdfEditorRuntimeService, UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
import PdfsUIZhCN from '@univerjs-pro/pdfs-ui/locale/zh-CN'
import { IUndoRedoService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import DrawingUIZhCN from '@univerjs/drawing-ui/locale/zh-CN'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { BuiltInUIPart, UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { createContract } from './data'

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
  root.className = 'pdf-markup'
  // Publish an explicit pending state immediately; an absent attribute is not readiness.
  root.dataset.ready = 'false'
  const editor = document.createElement('div')
  editor.className = 'pdf-markup-editor'
  root.append(editor)
  container.append(root)
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale: document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, PdfsUIEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DesignZhCN, UIZhCN, DocsUIZhCN, DrawingUIZhCN, PdfsUIZhCN),
    },
  })
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let api: FUniver
  let resize: ResizeObserver | undefined
  function dispose() {
    if (disposed) return
    disposed = true
    resize?.disconnect()
    unmount(editor)
    api?.disposeUnit('aster-markup-draft')
    univer.dispose()
    if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
    root.remove()
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: editor, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverPdfsPlugin)
    univer.registerPlugin(UniverPdfEditorPlugin)
    univer.registerPlugin(UniverPdfsUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    const pdf = createContract(api)
    // Initial authored content is not an end-user edit to undo.
    univer.__getInjector().get(IUndoRedoService).clearUndoRedo(pdf.getId())
    const runtime = univer.__getInjector().get(IPdfEditorRuntimeService)
    async function fit() {
      if (disposed) return
      api.setUIVisible(BuiltInUIPart.LEFT_SIDEBAR, root.clientWidth >= 800)
      await paint()
      if (disposed) return
      const area = editor.querySelector<HTMLElement>('[data-pdf-scroll-container]')
      if (!area) return
      const size = pdf.getPageByIndex(0)!.getData().size
      runtime.updateViewport(pdf.getId(), {
        zoom: Math.max(0.1, Math.min(1, (area.clientWidth - 48) / (size.width / 9525))),
      })
    }
    void (async () => {
      // Wait for the native workbench rather than publishing readiness under its startup skeleton.
      /* eslint-disable no-unmodified-loop-condition, no-await-in-loop -- Native lifecycle advances on browser frames. */
      while (
        !disposed &&
        (api.getCurrentLifecycleStage() < api.Enum.LifecycleStages.Rendered ||
          !editor.querySelector('[data-pdf-active-page-id] > canvas') ||
          editor.querySelector('[data-u-comp="workbench-skeleton-content"]'))
      )
        await paint()
      /* eslint-enable no-unmodified-loop-condition, no-await-in-loop */
      if (disposed) return
      await fit()
      if (disposed) return
      resize = new ResizeObserver(() => {
        void fit()
      })
      resize.observe(editor)
      await paint()
      if (disposed) return
      root.dataset.ready = 'true'
    })().catch((error) => {
      if (disposed) return
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'The native PDF review could not initialize. See the console for details.'
      root.prepend(alert)
      console.error(error)
    })
    return { univerAPI: api, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
