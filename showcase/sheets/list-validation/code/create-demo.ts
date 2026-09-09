import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import validationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData, getCategories } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'list-validation-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, validationEnUS),
    },
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
    for (const id of ['single', 'multiple', 'source']) {
      const sheet = workbook.getSheetBySheetId(id)!
      const ranges = id === 'single' ? ['B2:B7', 'C2:C7', 'D2:D7'] : ['B2:B7']
      ranges.forEach((address, index) => {
        const builder = univerAPI.newDataValidation()
        if (id === 'source') builder.requireValueInRange(sheet.getRange('H2:H6'), false, true)
        else builder.requireValueInList(getCategories(), id === 'multiple', true)
        sheet.getRange(address).setDataValidation(
          builder
            .setAllowBlank(true)
            .setAllowInvalid(true)
            .setOptions({
              renderMode: index === 0 ? 2 : index === 1 ? 1 : 0,
              showErrorMessage: true,
              errorTitle: 'Material category',
              error: 'Choose a material from the list.',
            })
            .build(),
        )
      })
    }
    workbook.setActiveSheet('single')
    workbook.getActiveSheet()!.getRange('B2').activate()
    root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  const dispose = () => {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
    univer.dispose()
    root.remove()
  }
  try {
    initialize()
  } catch (error) {
    dispose()
    throw error
  }
  return {
    univerAPI,
    workbook,
    dispose,
  }
}
