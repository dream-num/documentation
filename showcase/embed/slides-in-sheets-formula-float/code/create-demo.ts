import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedFullscreenService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
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
import { SheetDrawingAnchorType, UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import SheetsDrawingEnUS from '@univerjs/sheets-drawing-ui/locale/en-US'
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

import { CHILD_ID, createChildData, createHostData, FORMULA_CARDS, HOST_ID, SHEET_ID, SOURCE_NAME } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/shape-editor/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'atlas-embed'
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
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        ShapeEnUS,
        SlidesEnUS,
        EmbedEnUS,
        DrawingEnUS,
        SheetsDrawingEnUS,
        EngineFormulaEnUS,
        SheetsFormulaEnUS,
        SlidesCoreEnUS,
        EmbedUnitEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
          'shape-editor-ui': {
            ...ShapeEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
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
      univer.__getInjector().get(EmbedFullscreenService).exit('atlas-slide-float')
      // A null session means exit was requested, not that native scopes released.
      // Await the tracked SDK release even when the close button was just clicked.
      await fullscreenReleased
    }
    const errors: unknown[] = []
    // beta.2 defers embedded React-root disposal past its scoped LocaleService disposal.
    // Unmount only this demo's native menu/content roots before releasing their SDK owners.
    const childRoots = [
      ...root.querySelectorAll<HTMLElement>('[data-u-comp="embed-float-dom-live-content"]'),
      // Floating chrome is portalled outside the host root; restrict cleanup to this owned embed ID.
      ...root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id="atlas-slide-float"] [data-embed-floating-menu-entry]',
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
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'atlas-local-presentation',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['slide'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (
                disposed ||
                input.ref.unit.selector !== CHILD_ID ||
                input.unitType !== UniverInstanceType.UNIVER_SLIDE
              )
                throw new Error('Unknown Atlas presentation source')
              const existing = univer.__getInjector().get(IUniverInstanceService).getUnit(CHILD_ID, input.unitType)
              if (!existing) api.createPresentation(createChildData(), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_SLIDE }
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
        const embed = api.createEmbed({
          embedId: 'atlas-slide-float',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.SheetFloating,
            context: {
              subUnitId: SHEET_ID,
              placement: {
                kind: SheetDrawingAnchorType.Position,
                bounds: { left: 455, top: 112, width: 760, height: 427.5 },
              },
              resizeBehavior: 'aspect-ratio',
              aspectRatio: 16 / 9,
            },
          },
          content: { unitType: UniverInstanceType.UNIVER_SLIDE, ref: `#unit=${CHILD_ID}&type=slide` },
          displayTarget: { pageId: 'decision' },
        })
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        const references = [
          { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_SHEET },
        ] as const
        const deck = api.getPresentation(CHILD_ID)!
        for (const spec of FORMULA_CARDS) {
          const shape = deck.getSlideById(spec.page)?.getShape(spec.id)
          if (!shape) throw new Error('Missing native formula shape: ' + spec.id)
          shape.setFormula({ formula: spec.formula, externalReferences: references })
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        // Sheet is both the embedding host and the formula source.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The embedded presentation could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createWorkbook(createHostData())
    return { univerAPI: api, dispose }
  } catch (error) {
    void dispose().catch(console.error)
    throw error
  }
}
