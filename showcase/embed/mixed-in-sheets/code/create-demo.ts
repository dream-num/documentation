import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
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
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { SheetDrawingAnchorType, UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import SheetsDrawingUIEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import FormulaEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import NumfmtEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import {
  BASE_ID,
  BOARD_ID,
  DOCS_ID,
  SLIDES_ID,
  createBaseData,
  createBoardData,
  createDocsData,
  createSlidesData,
  createHostData,
  HOST_ID,
  SHEET_ID,
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
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs/docs/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'harbor-room-embed'
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
        DrawingUIEnUS,
        SheetsDrawingUIEnUS,
        InkUIEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        ShapeEnUS,
        SlidesEnUS,
        EmbedEnUS,
        BasesEnUS,
        BasesUIEnUS,
        BoardsUIEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
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
      // Floating chrome is portalled outside the host root; restrict cleanup to this owned embed ID.
      ...root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id="harbor-room-slide-float"] [data-embed-floating-menu-entry]',
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
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsDrawingPlugin)
    univer.registerPlugin(UniverSheetsDrawingUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin)
    const sources = [
      { id: SLIDES_ID, type: UniverInstanceType.UNIVER_SLIDE, kind: 'slide', data: createSlidesData },
      { id: DOCS_ID, type: UniverInstanceType.UNIVER_DOC, kind: 'doc', data: createDocsData },
      { id: BASE_ID, type: UniverInstanceType.UNIVER_BASE, kind: 'base', data: createBaseData },
      { id: BOARD_ID, type: UniverInstanceType.UNIVER_BOARD, kind: 'board', data: createBoardData },
    ] as const
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'harbor-room-local-sources',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['slide', 'doc', 'base', 'board'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              const source = sources.find((s) => s.id === input.ref.unit.selector && s.type === input.unitType)
              if (disposed || !source) throw new Error('Unknown Harbor decision-room source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(source.id, source.type)) {
                // Keep each SDK creation overload paired with its own snapshot type.
                switch (source.type) {
                  case UniverInstanceType.UNIVER_SLIDE:
                    instances.createUnit(source.type, source.data(), input.createOptions)
                    break
                  case UniverInstanceType.UNIVER_DOC:
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
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const embed = api.createEmbed({
          embedId: 'harbor-room-slide-float',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.SheetFloating,
            context: {
              subUnitId: SHEET_ID,
              placement: {
                kind: SheetDrawingAnchorType.Position,
                bounds: { left: 555, top: 112, width: 720, height: 405 },
              },
              resizeBehavior: 'aspect-ratio',
              aspectRatio: 16 / 9,
            },
          },
          content: { unitType: UniverInstanceType.UNIVER_SLIDE, ref: `#unit=${SLIDES_ID}&type=slide` },
          displayTarget: { pageId: 'decision' },
        })
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        // Separate native tabs are created in a stable order under the same workbook.
        for (const [index, source] of sources.slice(1).entries()) {
          if (disposed) return
          const names = ['Decision memo', 'Supplier operations', 'Delivery workflow']
          const tab = api.createEmbed({
            embedId: 'harbor-room-' + source.kind + '-tab',
            host: {
              unitId: HOST_ID,
              surface: api.Enum.FEmbedHostSurface.SheetTab,
              context: { sheetIndex: index + 1, sheetName: names[index] },
            },
            content: { unitType: source.type, ref: '#unit=' + source.id + '&type=' + source.kind },
            ...(source.kind === 'base' ? { displayTarget: { tableId: 'suppliers', viewId: 'suppliers-grid' } } : {}),
          })
          // eslint-disable-next-line no-await-in-loop -- Native tab insertion order is part of this example.
          await tab.loadAsync({ signal: abort.signal })
        }
        if (disposed) return
        api.getWorkbook(HOST_ID)!.setActiveSheet(SHEET_ID)
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        root.dataset.ready = 'error'
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent =
          'The decision room could not load completely. Reload to retry; details are in the console.'
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
