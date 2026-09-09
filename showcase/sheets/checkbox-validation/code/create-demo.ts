import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import validationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'checkbox-validation-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, validationEnUS) },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsDataValidationPreset()],
  })
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  const ownerWindow = window as Window & { univerAPI?: typeof univerAPI }
  ownerWindow.univerAPI = univerAPI
  let ready = false
  let disposed = false
  const initialize = () => {
    if (disposed || ready || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady) return
    ready = true
    for (const id of ['numeric', 'custom']) {
      const sheet = workbook.getSheetBySheetId(id)!
      const builder = univerAPI.newDataValidation()
      if (id === 'numeric') builder.requireCheckbox()
      else builder.requireCheckbox('Packed', 'Open')
      sheet.getRange('B2:B7').setDataValidation(
        builder
          .setAllowBlank(true)
          .setAllowInvalid(true)
          .setOptions({
            showErrorMessage: true,
            errorTitle: 'Checklist value',
            error: 'Use a checkbox value for this column.',
          })
          .build(),
      )
      // Adding checkbox validation initializes cells; seed the two states afterwards.
      sheet
        .getRange('B2:B7')
        .setValues(
          (id === 'numeric' ? [1, 0, 1, 0, 0, 1] : ['Packed', 'Open', 'Open', 'Packed', 'Open', 'Packed']).map((v) => [
            v,
          ]),
        )
    }
    workbook.setActiveSheet('numeric')
    workbook.getActiveSheet()!.getRange('B2').activate()
    root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  const dispose = () => {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    initialize()
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Checkbox initialization and cleanup failed', {
        cause: cleanupError,
      })
    }
    throw error
  }
  return { univerAPI, workbook, dispose }
}
