import { BooleanNumber } from '@univerjs/core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { CustomFilterOperator, UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import filterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'filter-gallery'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, filterEnUS) },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsFilterPreset()],
  })
  let initialized = false
  let disposed = false
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    initialized = true
    try {
      const workbook = univerAPI.getWorkbook('filter-gallery')!
      for (const sheet of workbook.getSheets()) {
        const filter = sheet.getRange('A4:E16').createFilter()
        if (!filter) throw new Error('The native filter could not be created.')
        switch (sheet.getSheetId()) {
          case 'values':
            filter.setColumnFilterCriteria(1, { colId: 1, filters: { filters: ['North', 'South'] } })
            break
          case 'band':
            filter.setColumnFilterCriteria(3, {
              colId: 3,
              customFilters: {
                and: BooleanNumber.TRUE,
                customFilters: [
                  { operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val: 10 },
                  { operator: CustomFilterOperator.LESS_THAN_OR_EQUAL, val: 40 },
                ],
              },
            })
            break
          case 'text':
            filter.setColumnFilterCriteria(2, { colId: 2, customFilters: { customFilters: [{ val: 'kit*' }] } })
            break
          case 'blank':
            filter.setColumnFilterCriteria(3, { colId: 3, filters: { blank: true, filters: [] } })
            break
          case 'combined':
            filter.setColumnFilterCriteria(1, { colId: 1, filters: { filters: ['North'] } })
            filter.setColumnFilterCriteria(4, { colId: 4, filters: { filters: ['Ready'] } })
            break
          case 'none':
            filter.setColumnFilterCriteria(3, {
              colId: 3,
              customFilters: { customFilters: [{ operator: CustomFilterOperator.GREATER_THAN, val: 500 }] },
            })
            break
        }
      }
      root.dataset.ready = 'true'
    } catch (error) {
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'Filter setup failed. Reload to retry; see the console for details.'
      root.prepend(alert)
      console.error(error)
    }
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  univerAPI.createWorkbook(createWorkbookData())
  initialize()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
