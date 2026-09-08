import type { BoardModel } from '@univerjs-pro/boards'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
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

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'board-images-gallery'
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
        ShapeEditorEnUS,
        EmbedUnitEnUS,
        InkUIEnUS,
      ),
    },
  })
  const owner = window as Window & { univerAPI?: FUniver }
  let api: FUniver | undefined
  let disposed = false,
    initialized = false,
    frame = 0
  let lifecycle: { dispose(): void } | undefined
  let alert: HTMLParagraphElement | undefined
  function dispose() {
    alert?.remove()
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    const errors: unknown[] = []
    for (const release of [() => lifecycle?.dispose(), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === api) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Board image cleanup failed')
  }
  function failure(cause: unknown) {
    try {
      dispose()
    } catch (cleanup) {
      return new AggregateError([cause, cleanup], 'Board image startup and cleanup failed', { cause })
    }
    return cause
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
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
    const board = univerAPI.createBoard(createData())
    owner.univerAPI = univerAPI
    const initialize = () => {
      if (disposed || initialized) return
      initialized = true
      frame = requestAnimationFrame(() => {
        if (disposed) return
        try {
          const injector = univer.__getInjector()
          const rect = root.getBoundingClientRect()
          injector
            .get(BoardViewportService)
            .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(board.getId()) ?? null, {
              viewportSize: { width: rect.width, height: rect.height },
              padding: 48,
              zoom: { maxZoomRatio: 1 },
            })
          root.dataset.ready = 'true'
        } catch (cause) {
          const error = failure(cause)
          alert = document.createElement('p')
          alert.setAttribute('role', 'alert')
          alert.textContent = 'The Board image gallery could not load. Reload to retry.'
          container.append(alert)
          console.error(error)
        }
      })
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) initialize()
    })
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) initialize()
    return { univerAPI, board, dispose }
  } catch (cause) {
    throw failure(cause)
  }
}
