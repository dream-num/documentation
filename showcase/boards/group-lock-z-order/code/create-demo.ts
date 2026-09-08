import type { BoardModel } from '@univerjs-pro/boards'
import { SetBoardElementsMetadataOperation, UniverBoardsPlugin } from '@univerjs-pro/boards'
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

import { createData, GROUP_IDS, NESTED_IDS } from './data'

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

function check(value: unknown) {
  if (!value) throw new Error('The SDK rejected the canvas organization setting.')
}

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'group-layer-demo'
  const editor = document.createElement('div')
  editor.className = 'group-layer-editor'
  editor.tabIndex = 0
  editor.setAttribute('aria-label', 'Canvas editor')
  const error = document.createElement('p')
  error.setAttribute('role', 'alert')
  error.hidden = true
  root.append(error, editor)
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

        // Demo-only product names; preserve every other official English translation.
        {
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
          'shape-editor-ui': {
            ...ShapeEditorEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEditorEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEditorEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
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
  let disposed = false,
    initialized = false,
    frame = 0
  let lifecycle: { dispose(): void } | undefined
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    // Board owns its native toolbar; the generic office ribbon is not an extra Board toolbar.
    univer.registerPlugin(UniverUIPlugin, {
      container: editor,
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
    const univerAPI = FUniver.newAPI(univer)
    const owner = window as Window & { univerAPI?: typeof univerAPI }
    const board = univerAPI.createBoard(createData())
    owner.univerAPI = univerAPI
    const initialize = () => {
      if (disposed || initialized) return
      initialized = true
      try {
        check(
          board.wrapElementsInContainer([...GROUP_IDS], {
            title: 'One group',
          }),
        )
        check(
          board.wrapElementsInContainer([...NESTED_IDS], {
            title: 'Inner group',
          }),
        )
        const inner = board.getElementParentChain('nested-a')[0]
        if (!inner) throw new Error('Missing inner group')
        check(
          board.wrapElementsInContainer([inner, 'nested-peer'], {
            title: 'Outer group',
          }),
        )
        check(board.bringElementsToFront(['layer-front']))
        // beta.2 metadata Facades reject valid locking patches; retain the real exported operation.
        check(
          univerAPI.syncExecuteCommand(SetBoardElementsMetadataOperation.id, {
            unitId: board.getId(),
            subUnitId: 'gallery',
            updates: [{ elementId: 'locked', metadata: { locked: true } }],
          }),
        )
        frame = requestAnimationFrame(() => {
          if (disposed) return
          const injector = univer.__getInjector()
          const rect = editor.getBoundingClientRect()
          injector
            .get(BoardViewportService)
            .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(board.getId()) ?? null, {
              viewportSize: { width: rect.width, height: rect.height },
              padding: 48,
              zoom: { maxZoomRatio: 1.15 },
            })
          root.dataset.ready = 'true'
        })
      } catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) initialize()
    })
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) initialize()
    return {
      univerAPI,
      board,
      dispose() {
        if (disposed) return
        disposed = true
        cancelAnimationFrame(frame)
        lifecycle?.dispose()
        if (owner.univerAPI === univerAPI) delete owner.univerAPI
        univer.dispose()
        root.remove()
      },
    }
  } catch (cause) {
    lifecycle?.dispose()
    univer.dispose()
    root.remove()
    throw cause
  }
}
