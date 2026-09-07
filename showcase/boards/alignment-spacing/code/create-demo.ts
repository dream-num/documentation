import type { BoardModel } from '@univerjs-pro/boards'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
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
import {
  AlignBottomIcon,
  AlignTopIcon,
  CreateCopyIcon,
  GripHorizontalIcon,
  GripVerticalIcon,
  LockIcon,
  VerticalCenterIcon,
} from '@univerjs/icons'
import { IconManager, UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'alignment-demo'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, BoardsUIEnUS) },
  })
  const cleanup: Array<() => void> = []
  const demoWindow = window as Window & { univer?: Univer; univerAPI?: FUniver }
  let disposed = false
  let frame = 0
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    const errors: unknown[] = []
    for (const release of [...cleanup.toReversed(), () => unmount(root), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (demoWindow.univer === univer) {
      delete demoWindow.univer
      delete demoWindow.univerAPI
    }
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Board cleanup failed')
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
    // Boards uses its native floating tools and context menus, not a second host toolbar.
    univer.registerPlugin(UniverBoardsUIPlugin, { gridVisible: false, interaction: { alignmentGuideThreshold: 6 } })
    // Register the official icons referenced by the native Board context menu.
    const icons = univer.__getInjector().get(IconManager)
    for (const [name, icon] of Object.entries({
      AlignBottomIcon,
      AlignTopIcon,
      CreateCopyIcon,
      GripHorizontalIcon,
      GripVerticalIcon,
      LockIcon,
      VerticalCenterIcon,
    })) {
      if (icons.has(name)) continue
      const registration = icons.register(name, icon)
      cleanup.push(() => registration.dispose())
    }
    const api = FUniver.newAPI(univer)
    demoWindow.univer = univer
    demoWindow.univerAPI = api
    let fitted = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Rendered || fitted || disposed) return
      fitted = true
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (disposed) return
          const injector = univer.__getInjector()
          const model = injector.get(IUniverInstanceService).getUnit<BoardModel>(DATA.id)
          const bounds = (root.querySelector('canvas') ?? root).getBoundingClientRect()
          injector.get(BoardViewportService).fitContent(model ?? null, {
            viewportSize: { width: bounds.width, height: bounds.height },
            padding: 80,
            zoom: { maxZoomRatio: 1.1 },
          })
          injector.get(IUniverInstanceService).focusUnit(DATA.id)
          root.dataset.ready = 'true'
        })
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBoard(structuredClone(DATA))
    return { univerAPI: api, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Board startup and cleanup failed', { cause: cleanupError })
    }
    throw error
  }
}
