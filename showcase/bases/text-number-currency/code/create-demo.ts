import type { IBaseSnapshot } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
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

import { createData, PEOPLE } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _locale: LocaleType = LocaleType.EN_US,
  saved: IBaseSnapshot = createData(),
) {
  if (saved?.id !== 'bracken-field-lab' || !['repairs', 'stations', 'checks'].every((id) => saved.tables?.[id]))
    throw new Error('Restore the original Bracken Relational Table and all three supporting tables.')
  const root = document.createElement('div')
  root.className = 'base-fields'
  root.dataset.ready = 'false'
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
  let api: FUniver | undefined
  let disposed = false
  const cleanup: Array<() => void> = []
  function dispose() {
    if (disposed) return
    disposed = true
    const errors: unknown[] = []
    // Unmount this owned workbench before its scoped locale and model services.
    for (const release of [
      ...cleanup.toReversed(),
      () => unmount(root),
      () => api?.disposeUnit(saved.id),
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
    if (errors.length) throw new AggregateError(errors, 'Bracken cleanup failed')
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
    const owner = api
    demoWindow.univerAPI = owner
    let finish!: () => void
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    const lifecycle = owner.addEvent(owner.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === owner.Enum.LifecycleStages.Rendered) finish()
    })
    cleanup.push(() => {
      finish()
      lifecycle.dispose()
    })
    const base = owner.createBase(structuredClone(saved))
    const ready = rendered
      .then(async () => {
        if (disposed) return
        owner.getBaseUI().setPersonOptions(PEOPLE)
        await owner.getBaseUI().activateTable('repairs')
        if (disposed) return
        await owner.getBaseUI().activateView('repairs-grid')
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
        owner.getBaseUI().openLeftSidebar()
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (!disposed) root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The repair café could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, ready, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
