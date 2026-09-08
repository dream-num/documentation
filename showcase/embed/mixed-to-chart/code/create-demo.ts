import type { IBaseSnapshot, IWorkbookData } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import ChartEnUS from '@univerjs-pro/chart-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverSheetsChartPlugin } from '@univerjs-pro/sheets-chart'
import { UniverSheetsChartUIPlugin } from '@univerjs-pro/sheets-chart-ui'
import SheetChartEnUS from '@univerjs-pro/sheets-chart-ui/locale/en-US'
import { ISheetPrintManagerService, UniverSheetsPrintPlugin } from '@univerjs-pro/sheets-print'
import PrintEnUS from '@univerjs-pro/sheets-print/locale/en-US'
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

import { SOURCE_ID, createSourceData, createHostData, HOST_ID, SOURCE_NAME, SHEET_ID } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/chart-ui/lib/index.css'
import '@univerjs-pro/sheets-chart-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/sheets-print/lib/index.css'
import './styles.css'

import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/sheets-chart/facade'
import '@univerjs-pro/chart-ui/facade'
import '@univerjs-pro/sheets-print/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: { host: IWorkbookData; source: IBaseSnapshot },
) {
  // Restore this example's two units, not arbitrary uploaded documents.
  if (
    saved &&
    (saved.host?.id !== HOST_ID ||
      saved.source?.id !== SOURCE_ID ||
      !saved.host.sheets?.[SHEET_ID] ||
      !saved.host.sheets?.targets ||
      !saved.source.tables?.income)
  ) {
    throw new Error('Restore both original Prism unit IDs, the comparison and targets Sheets and the income table.')
  }
  if (saved) {
    const resource = saved.host.resources?.find((entry) => entry.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
    const embed = JSON.parse(resource?.data || '{}').embeds?.['prism-income-tab']
    if (
      embed?.hostUnitId !== HOST_ID ||
      embed.source?.ref !== '#unit=' + SOURCE_ID + '&type=base' ||
      embed.entry !== 'sheets-sheet-tab' ||
      !saved.host.sheets?.[embed.hostAnchorId] ||
      !saved.host.sheetOrder?.includes(embed.hostAnchorId)
    )
      throw new Error('Restore the original Prism Base tab resource and its native Sheet anchor.')
  }
  const hostData = structuredClone(saved?.host ?? createHostData())
  const sourceData = structuredClone(saved?.source ?? createSourceData())
  const root = document.createElement('div')
  root.className = 'prism-embed'
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
        EngineFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        EmbedEnUS,
        BasesEnUS,
        BasesUIEnUS,
        ChartEnUS,
        SheetChartEnUS,
        EmbedUnitEnUS,
        DrawingEnUS,
        SheetDrawingEnUS,
        PrintEnUS,
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
    // beta.2 defers child React cleanup; release our child before its locale scope.
    const childRoots = root.querySelectorAll<HTMLElement>(
      `[data-embed-child-render-mode="base-workbench"][data-embed-child-render-unit-id="${SOURCE_ID}"]`,
    )
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(root),
      () => api?.disposeUnit(HOST_ID),
      () => api?.disposeUnit(SOURCE_ID),
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
    univer.registerPlugin(UniverSheetsPrintPlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'prism-local-base',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['base'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (
                disposed ||
                input.ref.unit.selector !== SOURCE_ID ||
                input.unitType !== UniverInstanceType.UNIVER_BASE
              )
                throw new Error('Unknown Prism Base source')
              const existing = univer.__getInjector().get(IUniverInstanceService).getUnit(SOURCE_ID, input.unitType)
              if (!existing)
                univer
                  .__getInjector()
                  .get(IUniverInstanceService)
                  .createUnit(input.unitType, structuredClone(sourceData), input.createOptions)
              return { unitId: SOURCE_ID, unitType: UniverInstanceType.UNIVER_BASE }
            },
          },
        },
      ],
    })
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
        const embed = saved
          ? api.getEmbed({ hostUnitId: HOST_ID, embedId: 'prism-income-tab' })
          : api.createEmbed({
              embedId: 'prism-income-tab',
              host: {
                unitId: HOST_ID,
                surface: api.Enum.FEmbedHostSurface.SheetTab,
                context: { sheetIndex: 2, sheetName: 'Income register' },
              },
              content: { unitType: UniverInstanceType.UNIVER_BASE, ref: `#unit=${SOURCE_ID}&type=base` },
              displayTarget: { tableId: 'income', viewId: 'income-grid' },
            })
        if (!embed) throw new Error('The saved Prism workbook has no native Base embed resource.')
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        if (
          !saved &&
          !api.getFormula().upsertExternalReference({
            unitId: HOST_ID,
            qualifier: SOURCE_NAME,
            sourceUnitId: SOURCE_ID,
            sourceUnitType: UniverInstanceType.UNIVER_BASE,
          })
        )
          throw new Error('Could not bind the income register')
        api.getWorkbook(HOST_ID)!.setActiveSheet(SHEET_ID)
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        const instances = univer.__getInjector().get(IUniverInstanceService)
        instances.focusUnit(HOST_ID)
        const sheet = api.getWorkbook(HOST_ID)!.getSheetBySheetId(SHEET_ID)!
        // Saved bindings and charts belong to the user; do not reseed either.
        if (!saved)
          await sheet.insertChart(
            sheet
              .newChart(api.Enum.ChartTypeString.Column)
              .setSource({
                sheetName: 'Plan versus actual',
                range: 'A6:C9',
                orientation: api.Enum.ChartSourceOrientation.Columns,
              })
              .setPosition({ row: 14, column: 0 })
              .setSize(990, 355)
              .setCategoryField(0)
              .setValueFields([1, 2])
              .setPalette(['#288B95', '#C79A43'])
              .setTitle('Prism / Selected income and target')
              .setLegend({ position: api.Enum.ChartLegendPositionEnum.Top })
              .build(),
          )
        if (disposed) return
        instances.focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The embedded Base could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createWorkbook(hostData)
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
