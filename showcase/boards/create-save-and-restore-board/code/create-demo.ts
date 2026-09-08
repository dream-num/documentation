import type { BoardModel, IBoardData } from '@univerjs-pro/boards'
import { createBoardThemePreset, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, ThemeService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
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

import { createData } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/shape-editor/facade'

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _locale: LocaleType = LocaleType.EN_US,
  saved?: IBoardData,
) {
  const data = structuredClone(saved ?? createData('default'))
  if (
    data.id !== 'tern-station-lifecycle' ||
    !data.pageOrder.length ||
    !data.pages[data.activePageId || data.pageOrder[0]] ||
    !data.pageOrder.every((id) => data.pages[id])
  )
    throw new Error('Restore the original Tern Canvas with a valid active page and page order.')
  const root = document.createElement('div')
  root.className = 'board-lifecycle'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        DrawingUIEnUS,
        BoardsUIEnUS,
        ShapeUIEnUS,
        InkUIEnUS,
        EmbedUnitEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
          'shape-editor-ui': {
            ...ShapeUIEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeUIEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeUIEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
          'embed-unit-ui': {
            ...EmbedUnitEnUS['embed-unit-ui'],
            referencedUnitViewer: {
              ...EmbedUnitEnUS['embed-unit-ui']['referencedUnitViewer'],
              base: 'Relational Tables',
            },
          },
        },
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
    if (errors.length) throw new AggregateError(errors, 'Tern Canvas cleanup failed')
  }
  // Public SDK viewport service; no duplicate Fit button and no invented Facade.
  async function fit() {
    if (disposed || !api?.getBoard(data.id)?.getElementOrder().length) return
    const injector = univer.__getInjector()
    injector
      .get(BoardViewportService)
      .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(data.id) ?? null, {
        viewportSize: { width: root.clientWidth, height: root.clientHeight },
        padding: 40,
        zoom: { maxZoomRatio: 1 },
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
    if (!saved)
      data.theme =
        createBoardThemePreset('default', (token) =>
          univer.__getInjector().get(ThemeService).getColorFromTheme(token),
        ) ?? undefined
    owner.createBoard(data)
    const ready = rendered
      .then(async () => {
        if (disposed) return
        await paint()
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
        alert.textContent = 'The field-station Canvas could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, ready, fit, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
