import type { BoardModel } from '@univerjs-pro/boards'
import { createBoardThemePreset, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import BoardsUIZhCN from '@univerjs-pro/boards-ui/locale/zh-CN'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import InkUIZhCN from '@univerjs-pro/ink-ui/locale/zh-CN'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import ShapeUIZhCN from '@univerjs-pro/shape-editor-ui/locale/zh-CN'
import { IUniverInstanceService, LocaleType, mergeLocales, ThemeService, Univer } from '@univerjs/core'
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
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/shape-editor/facade'

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
export function createDemo(container: HTMLElement, darkMode = false) {
  const data = structuredClone(DATA)
  const root = document.createElement('div')
  root.className = 'connector-routing'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        DrawingUIEnUS,
        BoardsUIEnUS,
        ShapeUIEnUS,
        InkUIEnUS,
      ),
      [LocaleType.ZH_CN]: mergeLocales(
        DesignZhCN,
        UIZhCN,
        DocsUIZhCN,
        DrawingUIZhCN,
        BoardsUIZhCN,
        ShapeUIZhCN,
        InkUIZhCN,
      ),
    },
  })
  let api: FUniver | undefined
  let disposed = false
  const cleanup: Array<() => void> = []
  const demoWindow = window as Window & { univerAPI?: FUniver }
  function dispose() {
    if (disposed) return
    disposed = true
    const errors: unknown[] = []
    for (const release of [
      ...cleanup.toReversed(),
      () => unmount(root),
      () => api?.disposeUnit(data.id),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Connector Board cleanup failed')
  }
  // Public SDK viewport service; no duplicate Fit button and no invented Facade.
  async function fit() {
    if (disposed || !api?.getBoard(data.id)?.getElementOrder().length) return
    const injector = univer.__getInjector()
    injector
      .get(BoardViewportService)
      .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(data.id) ?? null, {
        viewportSize: { width: root.clientWidth, height: root.clientHeight },
        padding: 60,
        zoom: { maxZoomRatio: 1.35 },
      })
    await paint()
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    // Boards owns its native floating toolbars. Grid remains the host UI preference.
    univer.registerPlugin(UniverUIPlugin, {
      container: root,
      ribbonType: 'grid',
      header: false,
      toolbar: false,
      footer: false,
    })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin, { gridVisible: false })
    api = FUniver.newAPI(univer)
    const owner = api
    demoWindow.univerAPI = owner
    let finish!: () => void
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    const lifecycle = owner.addEvent(owner.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === owner.Enum.LifecycleStages.Rendered) finish()
    })
    cleanup.push(() => {
      finish()
      lifecycle.dispose()
    })
    data.theme =
      createBoardThemePreset('default', (token) => univer.__getInjector().get(ThemeService).getColorFromTheme(token)) ??
      undefined
    owner.createBoard(data)
    const ready = rendered
      .then(async () => {
        if (disposed) return
        await paint()
        if (disposed) return
        /* eslint-disable no-unmodified-loop-condition, no-await-in-loop -- Native startup advances on browser frames. */
        while (
          !disposed &&
          (!root.querySelector('[data-board-viewport-host] canvas') ||
            root.querySelector('[data-u-comp="workbench-skeleton-content"]'))
        )
          await paint()
        /* eslint-enable no-unmodified-loop-condition, no-await-in-loop */
        if (disposed) return
        await fit()
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(data.id)
        root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The release-workflow Board could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, ready, fit, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
