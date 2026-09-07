import type { BoardModel, IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedFullscreenService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { EditorUIService, IEditorUIService } from '@univerjs-pro/slides-ui'
import SlidesEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { CHILD_ID, createChildData, createHostData, HOST_ID, PAGE_ID, SOURCE_NAME, FORMULA_CARDS } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  saved?: { host: IBoardData; source: IBaseSnapshot },
) {
  // This example restores its own two units, not arbitrary uploaded documents.
  if (
    saved &&
    (saved.host.id !== HOST_ID ||
      saved.source.id !== CHILD_ID ||
      !saved.host.pages[PAGE_ID] ||
      !saved.source.tables.tasks)
  ) {
    throw new Error('Restore both original Flint unit IDs, the delivery page and the tasks table.')
  }
  const hostData = structuredClone(saved?.host ?? createHostData())
  const sourceData = structuredClone(saved?.source ?? createChildData())
  const root = document.createElement('div')
  root.className = 'flint-embed'
  container.append(root)
  const abort = new AbortController()
  const cleanup: Array<() => void> = []
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        BoardsEnUS,
        ShapeEnUS,
        SlidesEnUS,
        EmbedEnUS,
        BasesEnUS,
        BasesUIEnUS,
      ),
    },
  })
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let api: FUniver
  let fullscreenReleased = Promise.resolve()
  async function dispose() {
    if (disposed) return
    disposed = true
    abort.abort()
    if (api) {
      const fullscreen = univer.__getInjector().get(EmbedFullscreenService)
      if (fullscreen.getSession()?.hostUnitId === HOST_ID) fullscreen.exit('flint-base-float')
      await fullscreenReleased
    }
    const errors: unknown[] = []
    // Release owned child React roots before their scoped services.
    const childRoots = [
      ...root.querySelectorAll<HTMLElement>('[data-u-comp="embed-float-dom-live-content"]'),
      ...root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id="flint-base-float"] [data-embed-floating-menu-entry]',
      ),
    ]
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(root),
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
    if (errors.length) throw new AggregateError(errors, 'Embed cleanup failed')
  }
  try {
    univer.registerPlugin(UniverLicensePlugin)
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
    // Board text editing uses this real SDK service without creating a Slides unit.
    UniverBoardsUIPlugin.registerRuntimeScopedDependencies(univer.__getInjector(), [
      [IEditorUIService, { useClass: EditorUIService }],
    ])
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin, { gridVisible: false })
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'flint-local-base',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['base'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (disposed || input.ref.unit.selector !== CHILD_ID || input.unitType !== UniverInstanceType.UNIVER_BASE)
                throw new Error('Unknown Flint Base source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(CHILD_ID, input.unitType))
                instances.createUnit(input.unitType, structuredClone(sourceData), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_BASE }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    const fullscreen = univer.__getInjector().get(EmbedFullscreenService)
    let releaseFullscreen: (() => void) | undefined
    const entered = fullscreen.session$.subscribe((session) => {
      if (session?.hostUnitId !== HOST_ID || releaseFullscreen) return
      fullscreenReleased = new Promise<void>((resolve) => {
        releaseFullscreen = resolve
      })
    })
    const exited = fullscreen.exited$.subscribe((session) => {
      if (session.hostUnitId !== HOST_ID) return
      const release = releaseFullscreen
      releaseFullscreen = undefined
      requestAnimationFrame(() => release?.())
    })
    cleanup.push(
      () => entered.unsubscribe(),
      () => exited.unsubscribe(),
    )
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const embed = saved
          ? api.getEmbed({ hostUnitId: HOST_ID, embedId: 'flint-base-float' })
          : api.createEmbed({
              embedId: 'flint-base-float',
              host: {
                unitId: HOST_ID,
                surface: api.Enum.FEmbedHostSurface.BoardFloating,
                context: { subUnitId: PAGE_ID, left: 80, top: 380, width: 930, height: 495 },
              },
              content: { unitType: UniverInstanceType.UNIVER_BASE, ref: `#unit=${CHILD_ID}&type=base` },
              displayTarget: { tableId: 'tasks', viewId: 'tasks-grid' },
            })
        if (!embed) throw new Error('The saved Flint Board has no native Base embed resource.')
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        // Restore saved bindings verbatim. Do not overwrite edited formulas with the starter definitions.
        for (const spec of saved ? [] : FORMULA_CARDS) {
          const shape = api.getBoard(HOST_ID)!.getShape(spec.id)
          if (!shape) throw new Error('Missing Flint Formula Shape: ' + spec.id)
          shape.setFormula({
            formula: spec.formula,
            externalReferences: [
              { qualifier: SOURCE_NAME, sourceUnitId: CHILD_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
            ],
          })
          shape.setFormulaAnimationEnabled(false)
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        // The native Base and delivery Board retain distinct models and history.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        if (disposed) return
        const viewport = root.querySelector<HTMLElement>('[data-board-viewport-host="true"]')
        if (viewport) {
          const bounds = viewport.getBoundingClientRect()
          const board = univer
            .__getInjector()
            .get(IUniverInstanceService)
            .getUnit<BoardModel>(HOST_ID, UniverInstanceType.UNIVER_BOARD)
          if (!board) throw new Error('The delivery Board is unavailable')
          univer
            .__getInjector()
            .get(BoardViewportService)
            .fitContent(board, {
              viewportSize: { width: bounds.width, height: bounds.height },
              padding: 70,
            })
        }
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The delivery Base could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBoard(hostData)
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch((cleanupError) => console.error('Embed startup cleanup failed', cleanupError))
    throw error
  }
}
