import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import validationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'date-number-validation-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, validationEnUS) },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsDataValidationPreset()],
  })
  let initialized = false
  let disposed = false
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    initialized = true
    try {
      const workbook = univerAPI.getWorkbook('validation-boundaries')!
      const rules = [
        [
          'numbers',
          'B4:B9',
          univerAPI.newDataValidation().requireNumberBetween(1, 12, true),
          'Enter a whole number from 1 through 12.',
        ],
        [
          'numbers',
          'C4:C9',
          univerAPI.newDataValidation().requireNumberBetween(0, 1),
          'Enter a decimal from 0 through 1.',
        ],
        [
          'numbers',
          'D4:D9',
          univerAPI.newDataValidation().requireNumberGreaterThan(0),
          'Enter a number greater than zero.',
        ],
        [
          'dates',
          'B4:B9',
          univerAPI.newDataValidation().requireDateBetween(new Date(2027, 8, 1), new Date(2027, 8, 30)),
          'Enter a date from September 1 through 30, 2027.',
        ],
        [
          'dates',
          'C4:C9',
          univerAPI.newDataValidation().requireDateBefore(new Date(2027, 8, 1)),
          'Enter a date before September 1, 2027.',
        ],
        [
          'dates',
          'D4:D9',
          univerAPI.newDataValidation().requireDateOnOrAfter(new Date(2027, 8, 1)),
          'Enter September 1, 2027 or a later date.',
        ],
      ] as const
      for (const [id, address, builder, error] of rules) {
        workbook
          .getSheetBySheetId(id)!
          .getRange(address)
          .setDataValidation(
            builder
              .setAllowBlank(true)
              .setAllowInvalid(true)
              .setOptions({
                showErrorMessage: true,
                errorTitle: 'Boundary check',
                error,
              })
              .build(),
          )
      }
      workbook.setActiveSheet('numbers')
      workbook.getActiveSheet()!.getRange('B4').activate()
      root.dataset.ready = 'true'
    } catch (error) {
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'Validation setup failed. Reload to retry; see the console for details.'
      root.prepend(alert)
      console.error(error)
    }
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  univerAPI.createWorkbook(createWorkbookData())
  initialize()
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      try {
        univer.dispose()
      } finally {
        root.remove()
      }
    },
  }
}
