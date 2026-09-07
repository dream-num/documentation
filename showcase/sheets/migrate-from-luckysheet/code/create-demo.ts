import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { luckyToUniver } from './core/lucky-to-univer'
import { luckyJson } from './data'

import './styles.css'
import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  container.dataset.ready = 'false'
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS, sheetsConditionalFormattingEnUS, sheetsDataValidationEnUS),
    },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container }),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsDataValidationPreset(),
    ],
  })

  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) container.dataset.ready = 'true'
  })
  univerAPI.createWorkbook(luckyToUniver(luckyJson))

  return {
    dispose() {
      lifecycle.dispose()
      univer.dispose()
      delete container.dataset.ready
    },
  }
}
