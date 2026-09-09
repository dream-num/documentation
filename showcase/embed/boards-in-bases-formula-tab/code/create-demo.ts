import type { IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { createBoardThemePreset, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { EmbedCreationService, EmbedHostEntryEnum, UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedHostRestoreService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { EditorUIService, IEditorUIService } from '@univerjs-pro/slides-ui'
import SlidesEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import SlidesCoreEnUS from '@univerjs-pro/slides/locale/en-US'
import {
  IUniverInstanceService,
  LocaleType,
  mergeLocales,
  ThemeService,
  Univer,
  UniverInstanceType,
} from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingEnUS from '@univerjs/drawing-ui/locale/en-US'
import EngineFormulaEnUS from '@univerjs/engine-formula/locale/en-US'
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FormulaEditorEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { CHILD_ID, createChildData, createHostData, HOST_ID, FORMULA_CARDS, SOURCE_NAME } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: { host: IBaseSnapshot; board: IBoardData },
) {
  // This restores the example's own pair, not arbitrary uploaded documents.
  if (saved && (saved.host?.id !== HOST_ID || saved.board?.id !== CHILD_ID || !saved.host.tables?.streams))
    throw new Error('Restore both original Reed unit IDs and the streams table.')
  const hostData = structuredClone(saved?.host ?? createHostData())
  const boardData = structuredClone(saved?.board ?? createChildData())
  const root = document.createElement('div')
  root.className = 'reed-embed'
  container.append(root)
  const abort = new AbortController()
  const cleanup: Array<() => void> = []
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        SlidesCoreEnUS,
        SheetsFormulaEnUS,
        FormulaEditorEnUS,
        DrawingEnUS,
        EngineFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        BasesEnUS,
        BasesUIEnUS,
        EmbedEnUS,
        SlidesEnUS,
        BoardsEnUS,
        ShapeEnUS,
        EmbedUnitEnUS,
      ),
    },
  })
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let api: FUniver
  function dispose() {
    if (disposed) return
    disposed = true
    abort.abort()
    const errors: unknown[] = []
    // Release owned child React roots before their scoped services.
    const childRoots = root.querySelectorAll<HTMLElement>(
      '[data-embed-bases-table-list-host="reed-operations-tab"] [data-embed-content-root="true"]',
    )
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(root),
      // Emit unitDisposed while Formula Shape listeners and commands still live.
      // Injector-wide disposal alone tears those services down in the wrong order.
      () => api?.disposeUnit(CHILD_ID),
      () => api?.disposeUnit(HOST_ID),
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
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid', header: true, toolbar: true })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    // The native Board text editor uses this real SDK service without a Slides unit.
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
          registrationId: 'reed-local-board',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['board'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (
                disposed ||
                input.ref.unit.selector !== CHILD_ID ||
                input.unitType !== UniverInstanceType.UNIVER_BOARD
              )
                throw new Error('Unknown Reed canvas source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(CHILD_ID, input.unitType)) {
                const data = structuredClone(boardData)
                // Match the SDK's theme-follow controller at first creation, not
                // only after the user toggles the application theme. Saved themes stay intact.
                if (!saved)
                  data.theme =
                    createBoardThemePreset('default', (token) =>
                      univer.__getInjector().get(ThemeService).getColorFromTheme(token),
                    ) ?? undefined
                instances.createUnit(input.unitType, data, input.createOptions)
              }
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_BOARD }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    // The Base stays the root unit, but its native workbench owns the grid canvas.
    // Thumbnails also own their canvas and can exist before startup on restore.
    // Neither belongs in the generic single-canvas focus switcher.
    const renderOwnership = univer
      .__getInjector()
      .get(IRenderManagerService)
      .created$.subscribe((render) => {
        if (render.unitId === HOST_ID || render.isThumbNail) render.isMainScene = false
      })
    cleanup.push(() => renderOwnership.unsubscribe())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        if (saved) {
          const embed = api.getEmbed({ hostUnitId: HOST_ID, embedId: 'reed-operations' })
          if (!embed) throw new Error('The saved Reed Base has no native canvas embed resource.')
          await embed.loadAsync({ signal: abort.signal })
        } else {
          // Materialize the local board before restoring its native Base table-list anchor.
          const hostContext = { tableIndex: 1, tableName: 'Operations map' }
          const { descriptor } = univer
            .__getInjector()
            .get(EmbedCreationService)
            .prepareCreateEmbed({
              embedId: 'reed-operations',
              hostUnitId: HOST_ID,
              hostType: UniverInstanceType.UNIVER_BASE,
              entry: EmbedHostEntryEnum.BasesTableListBlock,
              hostAnchorId: 'reed-operations-tab',
              hostContext,
              source: { unitType: UniverInstanceType.UNIVER_BOARD, ref: `#unit=${CHILD_ID}&type=board` },
            })
          const restoreService = univer.__getInjector().get(EmbedHostRestoreService)
          const materialized = await restoreService.materializeDescriptor({ descriptor, signal: abort.signal })
          if (disposed) return
          await restoreService.restoreEmbed({ descriptor: materialized, hostContext })
          if (disposed) return
          for (const spec of FORMULA_CARDS) {
            const shape = api.getBoard(CHILD_ID)!.getShape(spec.id)
            if (!shape) throw new Error('Missing Reed Formula Shape: ' + spec.id)
            shape.setFormula({
              formula: spec.formula,
              externalReferences: [
                { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
              ],
            })
            shape.setFormulaAnimationEnabled(false)
          }
        }
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        // Native Base navigation opens the board; its model and history stay independent.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The operations review could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBase(hostData)
    return { univerAPI: api, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Embed startup and cleanup failed', { cause: cleanupError })
    }
    throw error
  }
}
