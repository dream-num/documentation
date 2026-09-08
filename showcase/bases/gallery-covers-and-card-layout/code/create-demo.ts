import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const locale = LocaleType.EN_US
  const root = document.createElement('div')
  root.className = 'base-material-gallery'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        BasesEnUS,
        BasesUIEnUS,
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
        },
      ),
    },
  })
  const owner = window as Window & { univerAPI?: FUniver }
  let api: FUniver | undefined
  let disposed = false
  let lifecycle: { dispose(): void } | undefined
  let finish = () => {}
  function dispose() {
    if (disposed) return
    disposed = true
    finish()
    const errors: unknown[] = []
    for (const release of [
      () => lifecycle?.dispose(),
      () => unmount(root),
      () => api?.disposeUnit('material-library'),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === api) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Material gallery demo cleanup failed')
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    api = FUniver.newAPI(univer)
    const univerAPI = api
    owner.univerAPI = univerAPI
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) finish()
    })
    univerAPI.createBase(createData())
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) finish()
    const ready = rendered
      .then(async () => {
        if (disposed) return
        await univerAPI.getBaseUI().activateTable('materials')
        if (disposed) return
        await univerAPI.getBaseUI().activateView('medium')
        if (disposed) return
        univerAPI.getBaseUI().openLeftSidebar()
        root.dataset.ready = 'true'
      })
      .catch((cause) => {
        if (disposed) return
        root.dataset.error = String(cause)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The material gallery demo could not load. Reload to retry.'
        root.prepend(alert)
        console.error(cause)
      })
    return { univerAPI, ready, dispose }
  } catch (cause) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([cause, cleanupError], 'Material gallery initialization and cleanup failed')
    }
    throw cause
  }
}
