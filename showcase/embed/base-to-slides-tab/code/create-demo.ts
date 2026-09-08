import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { EmbedCreationService, EmbedHostEntryEnum, UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedHostRestoreService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { SetSlideZoomRatioOperation, UniverSlidesPlugin } from '@univerjs-pro/slides'
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
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FormulaEditorEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { CHILD_ID, createChildData, createHostData, HOST_ID, FORMULA_CARDS, SOURCE_NAME } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'violet-embed'
  const navigation = document.createElement('nav')
  navigation.className = 'violet-page-navigation'
  navigation.setAttribute('aria-label', 'Presentation pages')
  navigation.hidden = true
  const pagesButton = document.createElement('button')
  pagesButton.type = 'button'
  navigation.append(pagesButton)
  const workbench = document.createElement('div')
  workbench.className = 'violet-workbench'
  root.append(navigation, workbench)
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
        EmbedUnitEnUS,
        SheetsFormulaEnUS,
        FormulaEditorEnUS,
        DrawingEnUS,
        EngineFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        SlidesEnUS,
        ShapeEnUS,
        EmbedEnUS,
        BasesEnUS,
        BasesUIEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
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
    // Release owned child React roots before their scoped services.
    const childRoots = root.querySelectorAll<HTMLElement>('[data-embed-child-render-mode]')
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [
      ...cleanup.toReversed(),
      ...Array.from(childRoots, (child) => () => unmount(child)),
      () => unmount(workbench),
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
    univer.registerPlugin(UniverUIPlugin, { container: workbench, ribbonType: 'grid', header: true, toolbar: true })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverProFormulaEnginePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'violet-local-base',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['base'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (disposed || input.ref.unit.selector !== CHILD_ID || input.unitType !== UniverInstanceType.UNIVER_BASE)
                throw new Error('Unknown Violet Relational Table source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(CHILD_ID, input.unitType))
                instances.createUnit(input.unitType, createChildData(), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_BASE }
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
        // Match slides-embed-local: prepare, materialize, then create the native page.
        // beta.2 createEmbed + loadAsync leaves childUnitId absent on an existing page anchor.
        const hostContext = { pageIndex: 1, pageName: 'Editorial data' }
        const { descriptor } = univer
          .__getInjector()
          .get(EmbedCreationService)
          .prepareCreateEmbed({
            embedId: 'violet-launch-workstream',
            hostUnitId: HOST_ID,
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesPageListBlock,
            hostAnchorId: 'violet-launch-workstream-page',
            hostContext,
            source: { unitType: UniverInstanceType.UNIVER_BASE, ref: `#unit=${CHILD_ID}&type=base` },
            displayTarget: { tableId: 'pieces', viewId: 'pieces-grid' },
          })
        const restoreService = univer.__getInjector().get(EmbedHostRestoreService)
        const materialized = await restoreService.materializeDescriptor({ descriptor, signal: abort.signal })
        if (disposed) return
        await restoreService.restoreEmbed({ descriptor: materialized, hostContext })
        if (disposed) return
        for (const spec of FORMULA_CARDS) {
          const shape = api.getPresentation(HOST_ID)!.getSlideById(spec.page)!.getShape(spec.id)
          if (!shape) throw new Error('Missing Violet Formula Shape: ' + spec.id)
          shape.setFormula({
            formula: spec.formula,
            externalReferences: [
              { qualifier: SOURCE_NAME, sourceUnitId: CHILD_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
            ],
          })
          shape.setFormulaAnimationEnabled(false)
        }
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        const presentation = api.getPresentation(HOST_ID)!
        presentation.setActiveSlide(presentation.getSlideById('overview')!)
        // Embedding position and formula dependency are separate native concerns.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        if (disposed) return
        let compact = false
        let pagesOpen = true
        let fitFrame = 0
        const updateLayout = () => {
          const nextCompact = root.clientWidth < 640
          if (nextCompact !== compact) {
            compact = nextCompact
            pagesOpen = !compact
          }
          navigation.hidden = !compact
          pagesButton.textContent = pagesOpen ? 'Hide pages' : 'Show pages'
          pagesButton.setAttribute('aria-expanded', String(pagesOpen))
          api.setUIVisible(api.Enum.BuiltInUIPart.LEFT_SIDEBAR, pagesOpen)
          cancelAnimationFrame(fitFrame)
          // Wait for native layout after changing sidebar visibility; keep the same units.
          fitFrame = requestAnimationFrame(() => {
            fitFrame = requestAnimationFrame(() => {
              if (disposed) return
              const render = univer.__getInjector().get(IRenderManagerService).getRenderUnitById(HOST_ID)
              if (render && (!compact || !pagesOpen))
                api.syncExecuteCommand(SetSlideZoomRatioOperation.id, {
                  unitId: HOST_ID,
                  zoomRatio: Math.min(
                    1,
                    Math.max(1, render.engine.width - 32) / 1200,
                    Math.max(1, render.engine.height - 48) / 675,
                  ),
                })
            })
          })
        }
        pagesButton.addEventListener(
          'click',
          () => {
            pagesOpen = !pagesOpen
            updateLayout()
          },
          { signal: abort.signal },
        )
        const resize = new ResizeObserver(updateLayout)
        resize.observe(root)
        cleanup.push(() => {
          resize.disconnect()
          cancelAnimationFrame(fitFrame)
        })
        updateLayout()
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The editorial register could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createPresentation(createHostData())
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
