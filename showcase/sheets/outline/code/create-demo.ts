import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverSheetsOutlinePlugin } from '@univerjs-pro/sheets-outline'
import { UniverSheetsOutlineUIPlugin } from '@univerjs-pro/sheets-outline-ui'
import outlineEnUS from '@univerjs-pro/sheets-outline-ui/locale/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createFixture, VARIANTS } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs-pro/sheets-outline-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/sheets-outline/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'outline-demo'
  root.dataset.ready = 'false'
  const editor = document.createElement('div')
  editor.className = 'outline-editor'
  const error = document.createElement('p')
  error.setAttribute('role', 'alert')
  error.hidden = true
  root.append(error, editor)
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, outlineEnUS),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
    plugins: [UniverLicensePlugin, UniverSheetsOutlinePlugin, UniverSheetsOutlineUIPlugin],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  let disposed = false
  let initialized = false
  let lifecycle: { dispose(): void } | undefined
  try {
    const workbook = univerAPI.createWorkbook(createFixture())
    owner.univerAPI = univerAPI
    const initialize = () => {
      if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
      initialized = true
      try {
        for (const variant of VARIANTS) {
          const sheet = workbook.getSheetBySheetId(variant.id)!
          if (variant.id === 'columns') sheet.addColumnOutline(1, 5).addColumnOutline(1, 3)
          else {
            if (variant.id !== 'rows') sheet.addRowOutline(2, 8)
            sheet.addRowOutline(3, 3).addRowOutline(7, 3)
          }
          const groups = sheet.getDimensionOutlines()
          if (groups.length !== (variant.id === 'rows' || variant.id === 'columns' ? 2 : 3))
            throw new Error('Unexpected SDK outline count.')
          if (variant.id === 'parent' || variant.id === 'child') {
            const group = groups.find((item) => item.start === (variant.id === 'parent' ? 2 : 3))!
            sheet.setDimensionOutlineCollapsed(group.id, true)
          }
        }
        workbook.getActiveSheet().refreshCanvas()
        root.dataset.ready = 'true'
      } catch (cause) {
        root.dataset.ready = 'error'
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
    initialize()
    return {
      univerAPI,
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
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    univer.dispose()
    root.remove()
    throw cause
  }
}
