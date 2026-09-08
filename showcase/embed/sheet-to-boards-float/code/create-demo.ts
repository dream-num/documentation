import type { BoardModel } from '@univerjs-pro/boards'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { BoardViewportService, UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import {
  EmbedFullscreenService,
  registerEmbedProductMenuContribution,
  UniverEmbedUIPlugin,
} from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
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
  CHILD_ID,
  createChildData,
  createHostData,
  HOST_ID,
  SHEET_ID,
  PAGE_ID,
  SOURCE_NAME,
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
import './styles.css'

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
  root.className = 'willow-embed'
  container.append(root)
  const abort = new AbortController()
  const cleanup: Array<() => void> = []
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
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
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id="willow-sheet-float"] [data-embed-floating-menu-entry]',
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
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'willow-local-sheet',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['sheet'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (
                disposed ||
                input.ref.unit.selector !== CHILD_ID ||
                input.unitType !== UniverInstanceType.UNIVER_SHEET
              )
                throw new Error('Unknown Willow workbook source')
              const existing = univer.__getInjector().get(IUniverInstanceService).getUnit(CHILD_ID, input.unitType)
              if (!existing)
                univer
                  .__getInjector()
                  .get(IUniverInstanceService)
                  .createUnit(input.unitType, createChildData(), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_SHEET }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverEmbedUIPlugin)
    // Formula UI is registered above but is not in beta.2's default embed menu list.
    const formulaMenu = registerEmbedProductMenuContribution(univer.__getInjector(), {
      id: 'willow.sheet-formulas',
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
      if (workbook.getId() !== CHILD_ID || printConfigured) return
      // The print manager needs an active sheet; an unloaded/passive child is not enough.
      const printManager = univer.__getInjector().get(ISheetPrintManagerService)
      workbook.updatePrintConfig({ ...printManager.layoutConfig, scale: api.Enum.PrintScale.FitWidth })
      printConfigured = true
    })
    cleanup.push(() => beforePrint.dispose())
    // Print preview mounts in the host workbench, below beta.2's fullscreen shell.
    // Leave fullscreen after preparation has captured the child sheet; keep SDK CSS intact.
    const printOpened = api.addEvent(api.Event.SheetPrintOpen, ({ workbook }) => {
      if (workbook.getId() === CHILD_ID) univer.__getInjector().get(EmbedFullscreenService).exit('willow-sheet-float')
    })
    cleanup.push(() => printOpened.dispose())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const embed = api.createEmbed({
          embedId: 'willow-sheet-float',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.BoardFloating,
            context: {
              subUnitId: PAGE_ID,
              left: 80,
              top: 375,
              width: 850,
              height: 490,
            },
          },
          content: { unitType: UniverInstanceType.UNIVER_SHEET, ref: `#unit=${CHILD_ID}&type=sheet` },
          displayTarget: { subUnitId: SHEET_ID },
        })
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        const boardAPI = api.getBoard(HOST_ID)!
        for (const spec of FORMULA_CARDS) {
          const shape = boardAPI.getShape(spec.id)
          if (!shape) throw new Error('Missing Willow Formula Shape: ' + spec.id)
          shape.setFormula({
            formula: spec.formula,
            externalReferences: [
              { qualifier: SOURCE_NAME, sourceUnitId: CHILD_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
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
        univer.__getInjector().get(IUniverInstanceService).setCurrentUnitForType(CHILD_ID)
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
          if (!board) throw new Error('The workshop Canvas is unavailable')
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
        message.textContent = 'The embedded workbook could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBoard(createHostData())
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch((cleanupError) => console.error('Embed startup cleanup failed', cleanupError))
    throw error
  }
}
