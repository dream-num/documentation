import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { EmbedCreationService, EmbedHostEntryEnum, UniverEmbedPlugin } from '@univerjs-pro/embed'
import {
  EmbedActivationService,
  EmbedFullscreenService,
  EmbedHostRestoreService,
  registerEmbedProductMenuContribution,
  UniverEmbedUIPlugin,
} from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { SetSlideZoomRatioOperation, UniverSlidesPlugin } from '@univerjs-pro/slides'
import { EditorUIService, IEditorUIService, UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
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
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverDocsDrawingPlugin, UniverDocsDrawingUIPlugin } from '@univerjs/preset-docs-drawing'
import DocsDrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
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
import SheetsDrawingUIEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { SheetsFormulaUIMenuSchema, UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import FormulaEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
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
  DOCS_ID,
  BOARD_ID,
  createSheetData,
  createBaseData,
  createDocsData,
  createBoardData,
  createHostData,
  HOST_ID,
  SHEET_ID,
} from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
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
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/docs/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/embed/facade'
import '@univerjs-pro/sheets-print/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'beacon-review-embed'
  root.dataset.ready = 'false'
  container.append(root)
  const abort = new AbortController()
  const cleanup: Array<() => void> = []
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        SheetsDrawingUIEnUS,
        InkUIEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        DocsDrawingEnUS,
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
        BoardsUIEnUS,
        SlidesEnUS,
        ShapeEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
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
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
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
  async function dispose() {
    if (disposed) return
    disposed = true
    abort.abort()
    // beta.2 releases fullscreen scopes on its next animation frame. Keep the host
    // alive until that real release signal and its queued focus recovery complete.
    if (api) {
      const fullscreen = univer.__getInjector().get(EmbedFullscreenService)
      const session = fullscreen.getSession()
      if (session?.hostUnitId === HOST_ID) {
        await new Promise<void>((resolve) => {
          const exited = fullscreen.exited$.subscribe((released) => {
            if (released.embedId !== session.embedId) return
            exited.unsubscribe()
            requestAnimationFrame(() => resolve())
          })
          fullscreen.exit(session.embedId)
        })
      }
    }
    const errors: unknown[] = []
    // beta.2 defers embedded React-root disposal past its scoped LocaleService disposal.
    // Unmount only this demo's native menu/content roots before releasing their SDK owners.
    const childRoots = [
      ...root.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-live-content"], [data-embed-slides-page-list-host] [data-embed-content-root="true"], [data-embed-child-render-mode="base-workbench"]',
      ),
      // Floating chrome is portalled outside the host root; restrict cleanup to this owned embed ID.
      ...root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id^="beacon-review-"] [data-embed-floating-menu-entry]',
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
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid', header: true, toolbar: true })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverDocsDrawingPlugin)
    univer.registerPlugin(UniverDocsDrawingUIPlugin)
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
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin)
    const sources = [
      { id: SHEET_UNIT_ID, type: UniverInstanceType.UNIVER_SHEET, kind: 'sheet', data: createSheetData },
      { id: BASE_ID, type: UniverInstanceType.UNIVER_BASE, kind: 'base', data: createBaseData },
      { id: DOCS_ID, type: UniverInstanceType.UNIVER_DOC, kind: 'doc', data: createDocsData },
      { id: BOARD_ID, type: UniverInstanceType.UNIVER_BOARD, kind: 'board', data: createBoardData },
    ] as const
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'beacon-review-local-sources',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['sheet', 'base', 'doc', 'board'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              const source = sources.find((s) => s.id === input.ref.unit.selector && s.type === input.unitType)
              if (disposed || !source) throw new Error('Unknown Beacon review source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(source.id, source.type)) {
                // Keep each SDK creation overload paired with its own snapshot type.
                switch (source.type) {
                  case UniverInstanceType.UNIVER_DOC:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_SHEET:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_BASE:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_BOARD:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    // Slides already provides the root editor service. Extend the Board child
                    // scope only after Board startup, avoiding duplicate root registration.
                    UniverBoardsUIPlugin.registerRuntimeScopedDependencies(univer.__getInjector(), [
                      [IEditorUIService, { useClass: EditorUIService }],
                    ])
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
      id: 'beacon.sheet-formulas',
      childType: UniverInstanceType.UNIVER_SHEET,
      surface: 'ribbon',
      order: 100,
      menuSchema: SheetsFormulaUIMenuSchema,
    })
    if (formulaMenu) cleanup.push(() => formulaMenu.dispose())
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
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
      if (workbook.getId() !== SHEET_UNIT_ID) return
      const injector = univer.__getInjector()
      injector.get(EmbedFullscreenService).exit('beacon-review-sheet-float')
      // Print has captured its source. Release only this Float's editing chrome
      // so its portalled toolbar cannot cover the native preview.
      injector.get(EmbedActivationService).clearFloating('beacon-review-sheet-float', HOST_ID)
    })
    cleanup.push(() => printOpened.dispose())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const sheet = api.createEmbed({
          embedId: 'beacon-review-sheet-float',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.SlideFloating,
            context: { subUnitId: 'economics', left: 340, top: 130, width: 620, height: 365 },
          },
          content: { unitType: UniverInstanceType.UNIVER_SHEET, ref: '#unit=' + SHEET_UNIT_ID + '&type=sheet' },
          displayTarget: { subUnitId: SHEET_ID },
        })
        await sheet.loadAsync({ signal: abort.signal })
        if (disposed) return
        // beta.2's Slides page-list path needs a materialized child before inserting
        // its native page anchor, as in slides-embed-local. This is not an iframe.
        const restore = univer.__getInjector().get(EmbedHostRestoreService)
        for (const [index, kind] of ['doc', 'base', 'board'].entries()) {
          if (disposed) return
          const source = sources.find((s) => s.kind === kind)!
          const hostContext = {
            pageIndex: index + 3,
            pageName: ['Decision memo', 'Readiness register', 'Delivery map'][index],
          }
          const { descriptor } = univer
            .__getInjector()
            .get(EmbedCreationService)
            .prepareCreateEmbed({
              embedId: 'beacon-review-' + kind + '-tab',
              hostUnitId: HOST_ID,
              hostType: UniverInstanceType.UNIVER_SLIDE,
              entry: EmbedHostEntryEnum.SlidesPageListBlock,
              hostAnchorId: 'beacon-review-' + kind + '-page',
              hostContext,
              source: { unitType: source.type, ref: '#unit=' + source.id + '&type=' + kind },
              ...(kind === 'base' ? { displayTarget: { tableId: 'gates', viewId: 'gates-grid' } } : {}),
            })
          // eslint-disable-next-line no-await-in-loop -- Native page order is intentional.
          const materialized = await restore.materializeDescriptor({ descriptor, signal: abort.signal })
          if (disposed) return
          // eslint-disable-next-line no-await-in-loop -- Restore each materialized native page in order.
          await restore.restoreEmbed({ descriptor: materialized, hostContext })
        }
        if (disposed) return
        const instances = univer.__getInjector().get(IUniverInstanceService)
        instances.setCurrentUnitForType(SHEET_UNIT_ID)
        const deck = api.getPresentation(HOST_ID)!
        deck.setActiveSlide(deck.getSlideById('cover')!)
        instances.focusUnit(HOST_ID)
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        if (disposed) return
        const render = univer.__getInjector().get(IRenderManagerService).getRenderUnitById(HOST_ID)
        if (render)
          api.syncExecuteCommand(SetSlideZoomRatioOperation.id, {
            unitId: HOST_ID,
            zoomRatio: Math.min(
              1,
              Math.max(1, render.engine.width - 48) / 1000,
              Math.max(1, render.engine.height - 48) / 562.5,
            ),
          })
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        root.dataset.ready = 'error'
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent =
          'The executive review could not load all four resources. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createPresentation(createHostData())
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch((cleanupError) => console.error('Embed startup cleanup failed', cleanupError))
    throw error
  }
}
