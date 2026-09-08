import type { BoardModel } from '@univerjs-pro/boards'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import EmbedEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import InkEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingEnUS from '@univerjs/drawing-ui/locale/en-US'
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
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'swimlane-gallery'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        DrawingEnUS,
        BoardsEnUS,
        ShapeEnUS,
        EmbedEnUS,
        InkEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
          'boards-ui': {
            ...BoardsEnUS['boards-ui'],
            settings: { ...BoardsEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
          'shape-editor-ui': {
            ...ShapeEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
          'embed-unit-ui': {
            ...EmbedEnUS['embed-unit-ui'],
            referencedUnitViewer: { ...EmbedEnUS['embed-unit-ui']['referencedUnitViewer'], base: 'Relational Tables' },
          },
        },
      ),
    },
  })
  let api: FUniver | undefined,
    disposed = false,
    frame = 0
  const owner = window as Window & { univerAPI?: FUniver }
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    if (owner.univerAPI === api) delete owner.univerAPI
    const errors: unknown[] = []
    for (const release of [() => unmount(root), () => api?.disposeUnit('swimlane-gallery'), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Swimlane demo cleanup failed')
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    // Boards supplies its own native toolbar, not a second office ribbon.
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
    univer.registerPlugin(UniverBoardsUIPlugin)
    api = FUniver.newAPI(univer)
    const univerAPI = api
    owner.univerAPI = api
    const board = api.createBoard(createData())
    if (!board.setSwimlaneLaneCollapsed('unequal', 'review', true))
      throw new Error('The initial lane collapse was rejected')
    function initialize() {
      if (disposed) return
      const canvas = root.querySelector('canvas')
      if (
        univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Rendered ||
        !canvas ||
        root.querySelector('[data-u-comp="workbench-skeleton-content"]')
      ) {
        frame = requestAnimationFrame(initialize)
        return
      }
      const injector = univer.__getInjector()
      const rect = root.getBoundingClientRect()
      injector
        .get(BoardViewportService)
        .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(board.getId()) ?? null, {
          viewportSize: { width: rect.width, height: rect.height },
          padding: 45,
          zoom: { maxZoomRatio: 1 },
        })
      root.dataset.ready = 'true'
    }
    frame = requestAnimationFrame(initialize)
    return { univerAPI, board, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Swimlane startup and cleanup failed', { cause: cleanup })
    }
    throw error
  }
}
