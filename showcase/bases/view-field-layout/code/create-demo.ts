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

import { createData, VARIANTS } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

function requireSuccess(success: boolean) {
  if (!success) throw new Error('The SDK rejected the view layout.')
}

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'base-field-layout-demo'
  const editor = document.createElement('div')
  editor.className = 'base-field-layout-editor'
  const error = document.createElement('p')
  error.setAttribute('role', 'alert')
  error.hidden = true
  root.append(error, editor)
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
  let disposed = false
  let activating = false
  let lifecycle: { dispose(): void } | undefined
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: editor, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    const univerAPI = FUniver.newAPI(univer)
    const owner = window as Window & { univerAPI?: typeof univerAPI }
    const base = univerAPI.createBase(createData())
    const table = base.getTableById('records')!
    for (const variant of VARIANTS) {
      const view = table.getViewById(variant.id)!
      variant.order.slice(1).forEach((id, index) => {
        const order = view.getView().fieldOrder ?? []
        if (order[order.indexOf(id) - 1] !== variant.order[index])
          requireSuccess(view.moveField(id, { afterFieldId: variant.order[index] }))
      })
      for (const id of variant.order) {
        const visible = variant.visible.includes(id)
        if (!view.getFieldSettings(id).hidden !== visible) requireSuccess(view.setFieldVisible(id, visible))
      }
      if (view.getFieldSettings('sample').width !== variant.width)
        requireSuccess(view.setFieldWidth('sample', variant.width))
      requireSuccess(view.updateConfig({ rowHeight: variant.rowHeight, frozenFieldCount: variant.frozen }))
    }
    owner.univerAPI = univerAPI
    const activate = async () => {
      if (disposed || activating) return
      activating = true
      try {
        const ui = univerAPI.getBaseUI()
        await ui.activateTable('records')
        if (disposed) return
        await ui.activateView('full')
        if (disposed) return
        ui.openLeftSidebar()
        root.dataset.ready = 'true'
      } catch (cause) {
        if (!disposed) {
          error.textContent = cause instanceof Error ? cause.message : String(cause)
          error.hidden = false
        }
      }
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) void activate()
    })
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) void activate()
    return {
      univerAPI,
      base,
      dispose() {
        if (disposed) return
        disposed = true
        lifecycle?.dispose()
        if (owner.univerAPI === univerAPI) delete owner.univerAPI
        univer.dispose()
        root.remove()
      },
    }
  } catch (cause) {
    lifecycle?.dispose()
    univer.dispose()
    root.remove()
    throw cause
  }
}
