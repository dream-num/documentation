import { UniverDocsFormulaPlugin } from '@univerjs-pro/docs-formula'
import { UniverDocsFormulaUIPlugin } from '@univerjs-pro/docs-formula-ui'
import DocsFormulaEnUS from '@univerjs-pro/docs-formula-ui/locale/en-US'
import DocsFormulaZhCN from '@univerjs-pro/docs-formula-ui/locale/zh-CN'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import {
  EmbedFullscreenService,
  registerEmbedProductMenuContribution,
  UniverEmbedUIPlugin,
} from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedZhCN from '@univerjs-pro/embed-ui/locale/zh-CN'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import EmbedUnitZhCN from '@univerjs-pro/embed-unit-ui/locale/zh-CN'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import ShapeZhCN from '@univerjs-pro/shape-editor-ui/locale/zh-CN'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
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
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverDocsDrawingPlugin, UniverDocsDrawingUIPlugin } from '@univerjs/preset-docs-drawing'
import DocsDrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import DocsDrawingZhCN from '@univerjs/preset-docs-drawing/locales/zh-CN'
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
import AdvancedZhCN from '@univerjs/preset-sheets-advanced/locales/zh-CN'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import ConditionalEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import ConditionalZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import ValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import ValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import FilterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import FilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import LinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import LinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import NoteEnUS from '@univerjs/preset-sheets-note/locales/en-US'
import NoteZhCN from '@univerjs/preset-sheets-note/locales/zh-CN'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import SortEnUS from '@univerjs/preset-sheets-sort/locales/en-US'
import SortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'
import TableEnUS from '@univerjs/preset-sheets-table/locales/en-US'
import TableZhCN from '@univerjs/preset-sheets-table/locales/zh-CN'
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment'
import CommentEnUS from '@univerjs/preset-sheets-thread-comment/locales/en-US'
import CommentZhCN from '@univerjs/preset-sheets-thread-comment/locales/zh-CN'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { SheetsFormulaUIMenuSchema, UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
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

import {
  SHEET_UNIT_ID,
  createSheetData,
  createHostData,
  HOST_ID,
  SHEET_ID,
  BLOCK_MARKERS,
  INLINE_FORMULAS,
  SHEET_NAME,
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
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/docs-formula-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-formula/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/docs/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/embed/facade'
import '@univerjs-pro/sheets-print/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
) {
  const root = document.createElement('div')
  root.className = 'aster-embed'
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
        DocsFormulaEnUS,
        ShapeEnUS,
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
        EmbedUnitEnUS,
      ),
      [LocaleType.ZH_CN]: mergeLocales(
        DesignZhCN,
        UIZhCN,
        DocsZhCN,
        DocsFormulaZhCN,
        ShapeZhCN,
        DocsDrawingZhCN,
        ConditionalZhCN,
        AdvancedZhCN,
        ValidationZhCN,
        FilterZhCN,
        LinkZhCN,
        NoteZhCN,
        SortZhCN,
        TableZhCN,
        CommentZhCN,
        SheetsZhCN,
        SheetsUIZhCN,
        FormulaZhCN,
        NumfmtZhCN,
        EmbedZhCN,
        EmbedUnitZhCN,
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
    // beta.2 releases fullscreen scopes on its next animation frame. Keep the host
    // alive until that real release signal and its queued focus recovery complete.
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
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id^="aster-"] [data-embed-floating-menu-entry]',
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
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsFormulaPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverDocsDrawingPlugin)
    univer.registerPlugin(UniverDocsDrawingUIPlugin)
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
    ] as const
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'aster-local-sources',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['sheet'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              const source = sources.find((s) => s.id === input.ref.unit.selector && s.type === input.unitType)
              if (disposed || !source) throw new Error('Unknown Aster source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(source.id, source.type)) {
                instances.createUnit(source.type, source.data(), input.createOptions)
              }
              return { unitId: source.id, unitType: source.type }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverDocsFormulaUIPlugin)
    univer.registerPlugin(UniverEmbedUIPlugin)
    // Formula UI is registered above but is not in beta.2's default embed menu list.
    const formulaMenu = registerEmbedProductMenuContribution(univer.__getInjector(), {
      id: 'aster.sheet-formulas',
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
        univer.__getInjector().get(EmbedFullscreenService).exit('aster-sheet-block')
    })
    cleanup.push(() => printOpened.dispose())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        for (const [index, source] of sources.entries()) {
          if (disposed) return
          const startIndex = api.getDocument(HOST_ID)!.getBody()!.dataStream.indexOf(BLOCK_MARKERS[index]) - 1
          if (startIndex < 0) throw new Error('Missing project section anchor')
          const embed = api.createEmbed({
            embedId: 'aster-' + source.kind + '-block',
            host: {
              unitId: HOST_ID,
              surface: api.Enum.FEmbedHostSurface.DocBlock,
              context: { startIndex, interactionMode: 'block' },
            },
            content: { unitType: source.type, ref: '#unit=' + source.id + '&type=' + source.kind },
            displayTarget: { subUnitId: SHEET_ID },
          })
          // eslint-disable-next-line no-await-in-loop -- Recompute later body anchors after each insertion.
          await embed.loadAsync({ signal: abort.signal })
        }
        if (disposed) return
        const doc = api.getDocument(HOST_ID)!
        const externalReferences = [
          { qualifier: SHEET_NAME, sourceUnitId: SHEET_UNIT_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
        ] as const
        for (const spec of INLINE_FORMULAS) {
          // Earlier insertions shorten the body: resolve each authored marker against the current snapshot.
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
            throw new Error('Inline formula insertion failed: ' + spec.marker)
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent =
          'The research report could not load its observation Sheet. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createDocument(createHostData())
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch((cleanupError) => console.error('Embed startup cleanup failed', cleanupError))
    throw error
  }
}
