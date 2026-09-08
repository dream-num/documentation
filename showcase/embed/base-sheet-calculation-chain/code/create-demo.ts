import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import ChartEnUS from '@univerjs-pro/chart-ui/locale/en-US'
import { UniverDocsFormulaPlugin } from '@univerjs-pro/docs-formula'
import { UniverDocsFormulaUIPlugin } from '@univerjs-pro/docs-formula-ui'
import DocsFormulaEnUS from '@univerjs-pro/docs-formula-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSheetsChartPlugin } from '@univerjs-pro/sheets-chart'
import { UniverSheetsChartUIPlugin } from '@univerjs-pro/sheets-chart-ui'
import SheetChartEnUS from '@univerjs-pro/sheets-chart-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { EditorUIService, IEditorUIService, UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import SlidesCoreEnUS from '@univerjs-pro/slides/locale/en-US'
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
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import SheetDrawingEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
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
  BASE_ID,
  BASE_NAME,
  createBaseData,
  BOARD_ID,
  DOCS_ID,
  SLIDES_ID,
  createBoardData,
  createDocsData,
  createSlidesData,
  createHostData,
  HOST_ID,
  SHEET_ID,
  SOURCE_NAME,
  INLINE_FORMULAS,
  SLIDE_FORMULAS,
  BOARD_FORMULAS,
} from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/docs-formula-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/chart-ui/lib/index.css'
import '@univerjs-pro/sheets-chart-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/docs-formula/facade'
import '@univerjs-pro/shape-editor/facade'
import '@univerjs-pro/sheets-chart/facade'
import '@univerjs-pro/chart-ui/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'meridian-embed'
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
        EngineFormulaEnUS,
        BasesEnUS,
        BasesUIEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        DocsFormulaEnUS,
        EmbedUnitEnUS,
        ChartEnUS,
        SheetChartEnUS,
        DrawingEnUS,
        SheetDrawingEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        ShapeEnUS,
        SlidesEnUS,
        EmbedEnUS,
        BoardsUIEnUS,

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
          'embed-unit-ui': {
            ...EmbedUnitEnUS['embed-unit-ui'],
            referencedUnitViewer: {
              ...EmbedUnitEnUS['embed-unit-ui']['referencedUnitViewer'],
              base: 'Relational Tables',
            },
          },
          'shape-editor-ui': {
            ...ShapeEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
        },
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
    // beta.2 defers embedded React-root disposal past its scoped LocaleService disposal.
    // Unmount only this demo's native menu/content roots before releasing their SDK owners.
    const childRoots = [
      ...root.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-live-content"], [data-embed-sheets-sheet-tab-host] [data-embed-content-root="true"], [data-embed-child-render-mode="base-workbench"]',
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
    univer.registerPlugin(UniverDocsFormulaPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDocsFormulaUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsDrawingPlugin)
    univer.registerPlugin(UniverSheetsDrawingUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    univer.registerPlugin(UniverSheetsChartPlugin)
    univer.registerPlugin(UniverSheetsChartUIPlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    const sources = [
      { id: BASE_ID, type: UniverInstanceType.UNIVER_BASE, kind: 'base', data: createBaseData },
      { id: SLIDES_ID, type: UniverInstanceType.UNIVER_SLIDE, kind: 'slide', data: createSlidesData },
      { id: DOCS_ID, type: UniverInstanceType.UNIVER_DOC, kind: 'doc', data: createDocsData },
      { id: BOARD_ID, type: UniverInstanceType.UNIVER_BOARD, kind: 'board', data: createBoardData },
    ] as const
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'meridian-local-sources',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['base', 'slide', 'doc', 'board'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              const source = sources.find((s) => s.id === input.ref.unit.selector && s.type === input.unitType)
              if (disposed || !source) throw new Error('Unknown Meridian output source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(source.id, source.type)) {
                // Keep each SDK creation overload paired with its own snapshot type.
                switch (source.type) {
                  case UniverInstanceType.UNIVER_BASE:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_SLIDE:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_DOC:
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
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        // Separate native tabs are created in a stable order under the same workbook.
        for (const [index, source] of sources.entries()) {
          if (disposed) return
          const names = ['Edition register', 'Review deck', 'Brief', 'Production map']
          const tab = api.createEmbed({
            embedId: 'meridian-' + source.kind + '-tab',
            host: {
              unitId: HOST_ID,
              surface: api.Enum.FEmbedHostSurface.SheetTab,
              context: { sheetIndex: index + 1, sheetName: names[index] },
            },
            content: { unitType: source.type, ref: '#unit=' + source.id + '&type=' + source.kind },
            ...(source.kind === 'base' ? { displayTarget: { tableId: 'editions', viewId: 'editions-grid' } } : {}),
          })
          // eslint-disable-next-line no-await-in-loop -- Native tab insertion order is part of this example.
          await tab.loadAsync({ signal: abort.signal })
        }
        if (disposed) return
        // First leg: Base records feed the visible native Sheet formulas.
        if (
          !api.getFormula().upsertExternalReference({
            unitId: HOST_ID,
            qualifier: BASE_NAME,
            sourceUnitId: BASE_ID,
            sourceUnitType: UniverInstanceType.UNIVER_BASE,
          })
        )
          throw new Error('Could not bind the edition register to the calculation workbook')
        // Second leg: every narrative/card result reads the Sheet, not Base directly.
        const externalReferences = [
          { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
        ] as const
        for (const source of sources.filter((item) => item.kind !== 'base')) {
          if (!api.getFormula().upsertExternalReference({ unitId: source.id, ...externalReferences[0] }))
            throw new Error('Could not persist the Meridian source identity')
        }
        const doc = api.getDocument(DOCS_ID)!
        for (const spec of INLINE_FORMULAS) {
          const startOffset = doc.getBody()!.dataStream.indexOf(spec.marker)
          if (
            startOffset < 0 ||
            !doc.insertFormula({
              formula: spec.formula,
              startOffset,
              endOffset: startOffset + spec.marker.length,
              numberFormat: { pattern: spec.pattern },
              externalReferences,
            })
          )
            throw new Error('Could not insert inline formula ' + spec.marker)
        }
        const slides = api.getPresentation(SLIDES_ID)!
        for (const spec of SLIDE_FORMULAS) {
          const shape = slides.getSlideById(spec.page)?.getShape(spec.id)
          if (!shape) throw new Error('Missing slide formula ' + spec.id)
          shape.setFormula({ formula: spec.formula, externalReferences })
          shape.setFormulaAnimationEnabled(false)
        }
        const board = api.getBoard(BOARD_ID)!
        for (const spec of BOARD_FORMULAS) {
          const shape = board.getShape(spec.id)
          if (!shape) throw new Error('Missing Canvas formula ' + spec.id)
          shape.setFormula({ formula: spec.formula, externalReferences })
          shape.setFormulaAnimationEnabled(false)
        }
        api.getWorkbook(HOST_ID)!.setActiveSheet(SHEET_ID)
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        const sheet = api.getWorkbook(HOST_ID)!.getSheetBySheetId(SHEET_ID)!
        await sheet.insertChart(
          sheet
            .newChart(api.Enum.ChartTypeString.Column)
            .setSource({
              sheetName: 'Production model',
              range: 'A9:D11',
              orientation: api.Enum.ChartSourceOrientation.Columns,
            })
            .setPosition({ row: 19, column: 0 })
            .setSize(850, 350)
            .setCategoryField(0)
            .setValueFields([3])
            .setPalette(['#437D91'])
            .setTitle('Meridian / Calculated production amount')
            .setLegend({ position: api.Enum.ChartLegendPositionEnum.Top })
            .build(),
        )
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent =
          'The Meridian workspace could not load completely. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createWorkbook(createHostData())
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
