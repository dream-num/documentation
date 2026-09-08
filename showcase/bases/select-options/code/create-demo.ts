import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData, PEOPLE } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'base-options'
  root.dataset.ready = 'false'
  const editor = document.createElement('div')
  editor.className = 'base-options-editor'
  root.append(editor)
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
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
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let disposed = false
  let api: FUniver | undefined
  let lifecycle: { dispose(): void } | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let cancelReady: (() => void) | undefined
  function dispose() {
    if (disposed) return
    disposed = true
    clearTimeout(timer)
    cancelReady?.()
    lifecycle?.dispose()
    if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: editor, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    api = FUniver.newAPI(univer)
    const owner = api
    demoWindow.univerAPI = owner
    const ready = new Promise<void>((resolve, reject) => {
      cancelReady = resolve
      timer = setTimeout(
        () => reject(new Error('Relational Table renderer did not become ready within 15 seconds.')),
        15000,
      )
      lifecycle = owner.addEvent(owner.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === owner.Enum.LifecycleStages.Rendered) resolve()
      })
    })
    owner.createBase(createData())
    void ready
      .then(async () => {
        clearTimeout(timer)
        lifecycle?.dispose()
        if (disposed) return
        owner.getBaseUI().setPersonOptions(PEOPLE)
        await owner.getBaseUI().activateTable('surveys')
        if (disposed) return
        await owner.getBaseUI().activateView('surveys-grid')
        if (disposed) return
        owner.getBaseUI().openLeftSidebar()
        root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The coastal observatory could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
