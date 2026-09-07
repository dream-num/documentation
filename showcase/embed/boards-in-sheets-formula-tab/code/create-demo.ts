import { createBoardThemePreset, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import BoardsZhCN from '@univerjs-pro/boards-ui/locale/zh-CN'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedZhCN from '@univerjs-pro/embed-ui/locale/zh-CN'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import EmbedUnitZhCN from '@univerjs-pro/embed-unit-ui/locale/zh-CN'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import ShapeZhCN from '@univerjs-pro/shape-editor-ui/locale/zh-CN'
import { ISheetPrintManagerService, UniverSheetsPrintPlugin } from '@univerjs-pro/sheets-print'
import PrintEnUS from '@univerjs-pro/sheets-print/locale/en-US'
import PrintZhCN from '@univerjs-pro/sheets-print/locale/zh-CN'
import { EditorUIService, IEditorUIService } from '@univerjs-pro/slides-ui'
import SlidesEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import SlidesZhCN from '@univerjs-pro/slides-ui/locale/zh-CN'
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
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsEnUS from '@univerjs/docs-ui/locale/en-US'
import DocsZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingEnUS from '@univerjs/drawing-ui/locale/en-US'
import DrawingZhCN from '@univerjs/drawing-ui/locale/zh-CN'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import SheetDrawingEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
import SheetDrawingZhCN from '@univerjs/sheets-drawing-ui/locale/zh-CN'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import FormulaEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import FormulaZhCN from '@univerjs/sheets-formula-ui/locale/zh-CN'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import NumfmtEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import NumfmtZhCN from '@univerjs/sheets-numfmt-ui/locale/zh-CN'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { CHILD_ID, createChildData, createHostData, HOST_ID, SHEET_ID, SOURCE_NAME, FORMULA_CARDS } from './data'

import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/sheets-print/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/sheets-print/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/docs/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
) {
  const root = document.createElement('div')
  root.className = 'juniper-embed'
  container.append(root)
  const abort = new AbortController()
  const cleanup: Array<() => void> = []
  let disposed = false
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        BoardsEnUS,
        SlidesEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        EmbedEnUS,
        EmbedUnitEnUS,
        DrawingEnUS,
        SheetDrawingEnUS,
        PrintEnUS,
        ShapeEnUS,
      ),
      [LocaleType.ZH_CN]: mergeLocales(
        DesignZhCN,
        UIZhCN,
        DocsZhCN,
        BoardsZhCN,
        SlidesZhCN,
        SheetsZhCN,
        SheetsUIZhCN,
        FormulaZhCN,
        NumfmtZhCN,
        EmbedZhCN,
        EmbedUnitZhCN,
        DrawingZhCN,
        SheetDrawingZhCN,
        PrintZhCN,
        ShapeZhCN,
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
    const childRoots = root.querySelectorAll<HTMLElement>(
      '[data-embed-sheets-sheet-tab-host] [data-embed-content-root="true"]',
    )
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(root),
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
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsDrawingPlugin)
    univer.registerPlugin(UniverSheetsDrawingUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    UniverBoardsUIPlugin.registerRuntimeScopedDependencies(univer.__getInjector(), [
      [IEditorUIService, { useClass: EditorUIService }],
    ])
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin, { gridVisible: false })
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'juniper-local-board',
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
                throw new Error('Unknown Juniper Board source')
              const existing = univer.__getInjector().get(IUniverInstanceService).getUnit(CHILD_ID, input.unitType)
              if (!existing) {
                const data = createChildData()
                data.theme =
                  createBoardThemePreset('default', (token) =>
                    univer.__getInjector().get(ThemeService).getColorFromTheme(token),
                  ) ?? undefined
                univer.__getInjector().get(IUniverInstanceService).createUnit(input.unitType, data, input.createOptions)
              }
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_BOARD }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverSheetsPrintPlugin)
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let printConfigured = false
    const beforePrint = api.addEvent(api.Event.BeforeSheetPrintOpen, ({ workbook }) => {
      if (workbook.getId() !== HOST_ID || printConfigured) return
      const manager = univer.__getInjector().get(ISheetPrintManagerService)
      workbook.updatePrintConfig({ ...manager.layoutConfig, scale: api.Enum.PrintScale.FitPage })
      printConfigured = true
    })
    cleanup.push(() => beforePrint.dispose())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const embed = api.createEmbed({
          embedId: 'juniper-workshop-tab',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.SheetTab,
            context: { sheetIndex: 1, sheetName: 'Sensitivity workshop' },
          },
          content: { unitType: UniverInstanceType.UNIVER_BOARD, ref: `#unit=${CHILD_ID}&type=board` },
        })
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        for (const spec of FORMULA_CARDS) {
          const shape = api.getBoard(CHILD_ID)!.getShape(spec.id)
          if (!shape) throw new Error('Missing Juniper Formula Shape: ' + spec.id)
          shape.setFormula({
            formula: spec.formula,
            externalReferences: [
              { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
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
        // SheetBar owns the Board tab; the Sheet owns its inputs.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        api.getWorkbook(HOST_ID)!.setActiveSheet(SHEET_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The embedded Board could not load. Reload to retry; details are in the console.'
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
      console.error('Embed startup cleanup failed', cleanupError)
    }
    throw error
  }
}
