/* eslint-disable no-await-in-loop -- Load each native source before attaching the next Float. */
import type { BoardModel } from '@univerjs-pro/boards'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { createBoardThemePreset, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import {
  EmbedFullscreenService,
  registerEmbedProductMenuContribution,
  UniverEmbedUIPlugin,
} from '@univerjs-pro/embed-ui'
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
  ThemeService,
  LocaleType,
  mergeLocales,
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
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import {
  ISheetPrintManagerService,
  UniverSheetsChartPlugin,
  UniverSheetsChartUIPlugin,
  UniverSheetsOutlinePlugin,
  UniverSheetsOutlineUIPlugin,
  UniverSheetsPivotTablePlugin,
  UniverSheetsPivotTableUIPlugin,
  UniverSheetsPrintPlugin,
  UniverSheetsShapePlugin,
  UniverSheetsShapeUIPlugin,
  UniverSheetSparklinePlugin,
  UniverSheetSparklineUIPlugin,
} from '@univerjs/preset-sheets-advanced'
import AdvancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import ConditionalEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import ValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import FilterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import LinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import NoteEnUS from '@univerjs/preset-sheets-note/locales/en-US'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import SortEnUS from '@univerjs/preset-sheets-sort/locales/en-US'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'
import TableEnUS from '@univerjs/preset-sheets-table/locales/en-US'
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment'
import CommentEnUS from '@univerjs/preset-sheets-thread-comment/locales/en-US'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import SheetsDrawingEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { SheetsFormulaUIMenuSchema, UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import FormulaEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import NumfmtEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import {
  SHEET_UNIT_ID,
  BASE_ID,
  BASE_NAME,
  createBaseData,
  createSheetData,
  createHostData,
  HOST_ID,
  SHEET_ID,
  PAGE_ID,
  SHEET_NAME,
  FORMULA_CARDS,
} from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import '@univerjs/preset-sheets-hyper-link/lib/index.css'
import '@univerjs/preset-sheets-note/lib/index.css'
import '@univerjs/preset-sheets-sort/lib/index.css'
import '@univerjs/preset-sheets-table/lib/index.css'
import '@univerjs/preset-sheets-thread-comment/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/embed/facade'
import '@univerjs-pro/sheets-print/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'grove-embed'
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
        SheetsDrawingEnUS,
        DrawingEnUS,
        EngineFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        BoardsEnUS,
        ShapeEnUS,
        ConditionalEnUS,
        AdvancedEnUS,
        ValidationEnUS,
        FilterEnUS,
        LinkEnUS,
        NoteEnUS,
        SortEnUS,
        TableEnUS,
        CommentEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        EmbedEnUS,
        BasesEnUS,
        BasesUIEnUS,
        EmbedUnitEnUS,
        SlidesEnUS,

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
          'bases-ui': {
            ...BasesUIEnUS['bases-ui'],
            collaboration: {
              ...BasesUIEnUS['bases-ui']['collaboration'],
              localTooltip: 'Collaboration is disabled for these relational tables.',
              notCollabTooltip: 'These relational tables are not in collaboration mode.',
            },
            fieldConfig: {
              ...BasesUIEnUS['bases-ui']['fieldConfig'],
              formulaReferenceError: 'A1 references and ranges are not supported in Relational Tables formulas.',
              referenceCurrentField:
                'Reference the "{0}" field in the current relational table. It will be saved as [[#This Row],[{1}]] for the formula engine.',
            },
            fieldMenu: {
              ...BasesUIEnUS['bases-ui']['fieldMenu'],
              createSharedBaseField: 'Create a shared Relational Tables field',
            },
            viewMenus: {
              ...BasesUIEnUS['bases-ui']['viewMenus'],
              setWorkingDaysDescription:
                'Customize working days and days off, and apply them to the current relational tables',
            },
            formula: {
              ...BasesUIEnUS['bases-ui']['formula'],
              generic: {
                ...BasesUIEnUS['bases-ui']['formula']['generic'],
                engineDescription:
                  '{0} is provided by the Univer formula engine. Relational Tables supports field references such as TableName[[#This Row],[Field]] and OtherTable[Field], but does not support A1 cells, A1:B10 ranges, or spilled array output in formula fields.',
              },
            },
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
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let api: FUniver
  let fullscreenReleased = Promise.resolve()
  async function dispose() {
    if (disposed) return
    disposed = true
    abort.abort()
    if (api) {
      const fullscreen = univer.__getInjector().get(EmbedFullscreenService)
      const session = fullscreen.getSession()
      if (session?.hostUnitId === HOST_ID) fullscreen.exit(session.embedId)
      await fullscreenReleased
    }
    const errors: unknown[] = []
    // beta.2 defers embedded React-root disposal past its scoped LocaleService disposal.
    // Unmount only this demo's native menu/content roots before releasing their SDK owners.
    const childRoots = [
      ...root.querySelectorAll<HTMLElement>('[data-u-comp="embed-float-dom-live-content"]'),
      // Floating chrome is portalled outside the host root; restrict cleanup to this owned embed ID.
      ...root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id^="grove-"] [data-embed-floating-menu-entry]',
      ),
    ]
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(root),
      () => api?.disposeUnit(HOST_ID),
      () => api?.disposeUnit(SHEET_UNIT_ID),
      () => api?.disposeUnit(BASE_ID),
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
    // Board uses its own floating tools; the embedded Sheet supplies its native menus.
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
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin, { gridVisible: false })
    UniverBoardsUIPlugin.registerRuntimeScopedDependencies(univer.__getInjector(), [
      [IEditorUIService, { useClass: EditorUIService }],
    ])
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsDrawingPlugin)
    univer.registerPlugin(UniverSheetsDrawingUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    // beta.2 Embed supplies the full Sheets ribbon. Match its real feature plugins,
    // as in the SDK's docs-embed-local example; hidden menus still invoke factories.
    for (const preset of [
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsFilterPreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsSortPreset(),
      UniverSheetsTablePreset(),
      UniverSheetsThreadCommentPreset(),
    ]) {
      for (const entry of preset.plugins) {
        const [plugin, config] = Array.isArray(entry) ? entry : [entry]
        univer.registerPlugin(plugin, config)
      }
    }
    for (const plugin of [
      UniverSheetsOutlinePlugin,
      UniverSheetsOutlineUIPlugin,
      UniverSheetsPivotTablePlugin,
      UniverSheetsPivotTableUIPlugin,
      UniverSheetsChartPlugin,
      UniverSheetsChartUIPlugin,
      UniverSheetSparklinePlugin,
      UniverSheetSparklineUIPlugin,
      UniverSheetsShapePlugin,
      UniverSheetsShapeUIPlugin,
      UniverSheetsPrintPlugin,
    ])
      univer.registerPlugin(plugin)
    const sources = [
      { id: SHEET_UNIT_ID, type: UniverInstanceType.UNIVER_SHEET, kind: 'sheet', data: createSheetData },
      { id: BASE_ID, type: UniverInstanceType.UNIVER_BASE, kind: 'base', data: createBaseData },
    ] as const
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'grove-local-sources',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['sheet', 'base'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              const source = sources.find((s) => s.id === input.ref.unit.selector && s.type === input.unitType)
              if (disposed || !source) throw new Error('Unknown Grove source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(source.id, source.type)) {
                switch (source.type) {
                  case UniverInstanceType.UNIVER_SHEET:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_BASE:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                }
              }
              return { unitId: source.id, unitType: source.type }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverEmbedUIPlugin)
    // Formula UI is registered above but is not in beta.2's default embed menu list.
    const formulaMenu = registerEmbedProductMenuContribution(univer.__getInjector(), {
      id: 'grove.sheet-formulas',
      childType: UniverInstanceType.UNIVER_SHEET,
      surface: 'ribbon',
      order: 100,
      menuSchema: SheetsFormulaUIMenuSchema,
    })
    if (formulaMenu) cleanup.push(() => formulaMenu.dispose())
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
    let printConfigured = false
    const beforePrint = api.addEvent(api.Event.BeforeSheetPrintOpen, ({ workbook }) => {
      if (workbook.getId() !== SHEET_UNIT_ID || printConfigured) return
      // The print manager needs an active sheet; an unloaded/passive child is not enough.
      const printManager = univer.__getInjector().get(ISheetPrintManagerService)
      workbook.updatePrintConfig({ ...printManager.layoutConfig, scale: api.Enum.PrintScale.FitWidth })
      printConfigured = true
    })
    cleanup.push(() => beforePrint.dispose())
    // Print preview mounts in the host workbench, below beta.2's fullscreen shell.
    // Leave fullscreen after preparation has captured the child sheet; keep SDK CSS intact.
    const printOpened = api.addEvent(api.Event.SheetPrintOpen, ({ workbook }) => {
      if (workbook.getId() === SHEET_UNIT_ID)
        univer.__getInjector().get(EmbedFullscreenService).exit('grove-sheet-float')
    })
    cleanup.push(() => printOpened.dispose())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        for (const [index, source] of sources.entries()) {
          if (disposed) return
          const embed = api.createEmbed({
            embedId: 'grove-' + source.kind + '-float',
            host: {
              unitId: HOST_ID,
              surface: api.Enum.FEmbedHostSurface.BoardFloating,
              context: {
                subUnitId: PAGE_ID,
                left: index === 0 ? 80 : 820,
                top: 620,
                width: index === 0 ? 710 : 820,
                height: 380,
              },
            },
            content: { unitType: source.type, ref: '#unit=' + source.id + '&type=' + source.kind },
            displayTarget: index === 0 ? { subUnitId: SHEET_ID } : { tableId: 'gates', viewId: 'gates-grid' },
          })
          await embed.loadAsync({ signal: abort.signal })
        }
        if (disposed) return
        const boardAPI = api.getBoard(HOST_ID)!
        for (const spec of FORMULA_CARDS) {
          const shape = boardAPI.getShape(spec.id)
          if (!shape) throw new Error('Missing Grove Formula Shape: ' + spec.id)
          shape.setFormula({
            formula: spec.formula,
            externalReferences: [
              { qualifier: SHEET_NAME, sourceUnitId: SHEET_UNIT_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
              { qualifier: BASE_NAME, sourceUnitId: BASE_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
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
        // beta.2's number-format interceptor reads the current workbook even for an explicit FRange.
        // This case owns one workbook: select its type without moving focus away from Boards.
        univer.__getInjector().get(IUniverInstanceService).setCurrentUnitForType(SHEET_UNIT_ID)
        // Board owns the native floating drawing; the workbook keeps its own model and history.
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
          if (!board) throw new Error('The readiness Canvas is unavailable')
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
        message.textContent = 'The embedded sources could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    const hostData = createHostData()
    hostData.theme = createBoardThemePreset('default', (token) =>
      univer.__getInjector().get(ThemeService).getColorFromTheme(token),
    )
    api.createBoard(hostData)
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch((cleanupError) => console.error('Embed startup cleanup failed', cleanupError))
    throw error
  }
}
