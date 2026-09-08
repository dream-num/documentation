import { UniverEmbedPlugin } from '@univerjs-pro/embed'
import { UniverEmbedUIPlugin } from '@univerjs-pro/embed-ui'
import EmbedEnUS from '@univerjs-pro/embed-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverLicensePlugin } from '@univerjs-pro/license'
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
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
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

import { CHILD_ID, createChildData, createHostData, HOST_ID } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-drawing-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs-pro/embed-ui/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/docs/facade'
import '@univerjs-pro/embed/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'juniper-embed'
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
        DesignEnUS,
        DrawingUIEnUS,
        SheetsDrawingUIEnUS,
        UIEnUS,
        DocsEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        FormulaEnUS,
        NumfmtEnUS,
        EmbedEnUS,
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
    // Unmount the SDK workbench while host units and locale services still exist.
    for (const release of [...cleanup.toReversed(), () => unmount(root), () => univer.dispose()]) {
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
    univer.registerPlugin(UniverEmbedPlugin, {
      resourceRefUnitProviderRegistrations: [
        {
          registrationId: 'juniper-local-document',
          priority: 200,
          match: { fileKinds: ['self'], unitTypes: ['doc'] },
          provider: {
            ensureUnit(input) {
              input.signal?.throwIfAborted()
              if (disposed || input.ref.unit.selector !== CHILD_ID || input.unitType !== UniverInstanceType.UNIVER_DOC)
                throw new Error('Unknown Juniper document source')
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
    univer.registerPlugin(UniverEmbedUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let started = false
    const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Steady || started || disposed) return
      started = true
      void (async () => {
        const embed = api.createEmbed({
          embedId: 'juniper-assumptions-tab',
          host: {
            unitId: HOST_ID,
            surface: api.Enum.FEmbedHostSurface.SheetTab,
            context: { sheetIndex: 1, sheetName: 'Assumptions' },
          },
          content: { unitType: UniverInstanceType.UNIVER_DOC, ref: `#unit=${CHILD_ID}&type=doc` },
        })
        await embed.loadAsync({ signal: abort.signal })
        if (disposed) return
        // The native SheetBar mounts the child when the reader selects the Assumptions tab.
        univer.__getInjector().get(IUniverInstanceService).focusUnit(HOST_ID)
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        root.dataset.ready = 'false'
        root.dataset.error = String(error)
        const message = document.createElement('p')
        message.setAttribute('role', 'alert')
        message.textContent = 'The embedded document could not load. Reload to retry; details are in the console.'
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
