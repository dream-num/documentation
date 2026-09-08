import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverDocsFormulaPlugin } from '@univerjs-pro/docs-formula'
import { UniverDocsFormulaUIPlugin } from '@univerjs-pro/docs-formula-ui'
import DocsFormulaEnUS from '@univerjs-pro/docs-formula-ui/locale/en-US'
import { EmbedCreationService, EmbedHostEntryEnum, UniverEmbedPlugin } from '@univerjs-pro/embed'
import { EmbedHostRestoreService, UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
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
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FormulaEditorEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { CHILD_ID, createChildData, createHostData, HOST_ID, SOURCE_NAME, INLINE_FORMULAS } from './data'

import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import '@univerjs-pro/docs-formula-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/docs-formula/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs-pro/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'ember-embed'
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
        FormulaEditorEnUS,
        EngineFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsEnUS,
        BasesEnUS,
        BasesUIEnUS,
        EmbedEnUS,
        DocsFormulaEnUS,
        EmbedUnitEnUS,
        DrawingEnUS,
        ShapeEnUS,
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
    // Release the owned native Doc content before its scoped locale is disposed.
    const childRoots = root.querySelectorAll<HTMLElement>('[data-embed-content-root="true"]')
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
    univer.registerPlugin(UniverDocsFormulaPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'ember-local-document',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['doc'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (disposed || input.ref.unit.selector !== CHILD_ID || input.unitType !== UniverInstanceType.UNIVER_DOC)
                throw new Error('Unknown Ember document source')
              const existing = univer.__getInjector().get(IUniverInstanceService).getUnit(CHILD_ID, input.unitType)
              if (!existing)
                univer
                  .__getInjector()
                  .get(IUniverInstanceService)
                  .createUnit(input.unitType, createChildData(), input.createOptions)
              return { unitId: CHILD_ID, unitType: UniverInstanceType.UNIVER_DOC }
            },
          },
        },
      ],
    })
    univer.registerPlugin(UniverDocsFormulaUIPlugin)
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    // Native Base workbench owns its canvas; it is not a generic main scene.
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
        const hostContext = { tableIndex: 1, tableName: 'Release notes' }
        const { descriptor } = univer
          .__getInjector()
          .get(EmbedCreationService)
          .prepareCreateEmbed({
            embedId: 'ember-release-notes',
            hostUnitId: HOST_ID,
            hostType: UniverInstanceType.UNIVER_BASE,
            entry: EmbedHostEntryEnum.BasesTableListBlock,
            hostAnchorId: 'ember-release-notes-tab',
            hostContext,
            source: { unitType: UniverInstanceType.UNIVER_DOC, ref: `#unit=${CHILD_ID}&type=doc` },
          })
        const restore = univer.__getInjector().get(EmbedHostRestoreService)
        const materialized = await restore.materializeDescriptor({ descriptor, signal: abort.signal })
        if (disposed) return
        await restore.restoreEmbed({ descriptor: materialized, hostContext })
        if (disposed) return
        const doc = api.getDocument(CHILD_ID)!
        const externalReferences = [
          { qualifier: SOURCE_NAME, sourceUnitId: HOST_ID, sourceUnitType: UniverInstanceType.UNIVER_BASE },
        ] as const
        if (!api.getFormula().upsertExternalReference({ unitId: CHILD_ID, ...externalReferences[0] }))
          throw new Error('Native Base source mapping failed')
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
            throw new Error('Native document formula insertion failed: ' + spec.marker)
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (disposed) return
        const calculated = api.getFormula().onCalculationResultApplied(30000)
        api.getFormula().executeCalculation()
        await calculated
        if (disposed) return
        // The Base table list owns the native document tab; records remain independent.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The embedded document could not load. Reload to retry; details are in the console.'
        root.prepend(message)
        console.error(error)
      })
    })
    cleanup.push(() => lifecycle.dispose())
    api.createBase(createHostData())
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
