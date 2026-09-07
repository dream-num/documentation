import type { ISlideData } from '@univerjs-pro/slides'
import type { IBaseSnapshot } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesUIZhCN from '@univerjs-pro/bases-ui/locale/zh-CN'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import BasesZhCN from '@univerjs-pro/bases/locale/zh-CN'
import { EmbedCreationService, EmbedHostEntryEnum, UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedHostRestoreService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedZhCN from '@univerjs-pro/embed-ui/locale/zh-CN'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import EmbedUnitZhCN from '@univerjs-pro/embed-unit-ui/locale/zh-CN'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import ShapeZhCN from '@univerjs-pro/shape-editor-ui/locale/zh-CN'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import SlidesZhCN from '@univerjs-pro/slides-ui/locale/zh-CN'
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
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { CHILD_ID, createChildData, createHostData, HOST_ID, FORMULA_CARDS, SOURCE_NAME } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/shape-editor/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs/ui/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: { host: IBaseSnapshot; presentation: ISlideData },
) {
  // This restores the example's own pair, not arbitrary uploaded documents.
  if (saved && (saved.host?.id !== HOST_ID || saved.presentation?.id !== CHILD_ID || !saved.host.tables?.projects))
    throw new Error('Restore both original Indigo unit IDs and the projects table.')
  const hostData = structuredClone(saved?.host ?? createHostData())
  const presentationData = structuredClone(saved?.presentation ?? createChildData())
  const root = document.createElement('div')
  root.className = 'indigo-embed'
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
        BasesEnUS,
        BasesUIEnUS,
        EmbedEnUS,
        SlidesEnUS,
        ShapeEnUS,
        EmbedUnitEnUS,
      ),
      [LocaleType.ZH_CN]: mergeLocales(
        DesignZhCN,
        UIZhCN,
        DocsZhCN,
        BasesZhCN,
        BasesUIZhCN,
        EmbedZhCN,
        SlidesZhCN,
        ShapeZhCN,
        EmbedUnitZhCN,
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
      () => unmount(root),
      // Emit unitDisposed while Formula Shape listeners and commands still live.
      // Injector-wide disposal alone tears those services down in the wrong order.
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
          registrationId: 'indigo-local-presentation',
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
                throw new Error('Unknown Indigo presentation source')
              const instances = univer.__getInjector().get(IUniverInstanceService)
              if (!instances.getUnit(CHILD_ID, input.unitType))
                instances.createUnit(input.unitType, structuredClone(presentationData), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_SLIDE }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    // The Base stays the root unit, but its native workbench owns the grid canvas.
    // Thumbnails also own their canvas and can exist before startup on restore.
    // Neither belongs in the generic single-canvas focus switcher.
    const renderOwnership = univer
      .__getInjector()
      .get(IRenderManagerService)
      .created$.subscribe((render) => {
        if (render.unitId === HOST_ID || render.isThumbNail) render.isMainScene = false
      })
    cleanup.push(() => renderOwnership.unsubscribe())
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        if (saved) {
          const embed = api.getEmbed({ hostUnitId: HOST_ID, embedId: 'indigo-portfolio' })
          if (!embed) throw new Error('The saved Indigo Base has no native presentation embed resource.')
          await embed.loadAsync({ signal: abort.signal })
        } else {
          // Materialize the local presentation before restoring its native Base table-list anchor.
          const hostContext = { tableIndex: 1, tableName: 'Portfolio review' }
          const { descriptor } = univer
            .__getInjector()
            .get(EmbedCreationService)
            .prepareCreateEmbed({
              embedId: 'indigo-portfolio',
              hostUnitId: HOST_ID,
              hostType: UniverInstanceType.UNIVER_BASE,
              entry: EmbedHostEntryEnum.BasesTableListBlock,
              hostAnchorId: 'indigo-portfolio-tab',
              hostContext,
              displayTarget: { pageId: 'overview' },
              source: { unitType: UniverInstanceType.UNIVER_SLIDE, ref: `#unit=${CHILD_ID}&type=slide` },
            })
          const restoreService = univer.__getInjector().get(EmbedHostRestoreService)
          const materialized = await restoreService.materializeDescriptor({ descriptor, signal: abort.signal })
          if (disposed) return
          await restoreService.restoreEmbed({ descriptor: materialized, hostContext })
          if (disposed) return
          for (const spec of FORMULA_CARDS) {
            const shape = api.getPresentation(CHILD_ID)!.getSlideById(spec.page)!.getShape(spec.id)
            if (!shape) throw new Error('Missing Indigo Formula Shape: ' + spec.id)
            shape.setFormula({
              formula: spec.formula,
              externalReferences: [
                { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
              ],
            })
            shape.setFormulaAnimationEnabled(false)
          }
        }
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        // Native Base navigation opens the presentation; its model and history stay independent.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The portfolio review could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBase(hostData)
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
