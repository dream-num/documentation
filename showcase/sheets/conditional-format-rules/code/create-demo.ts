import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import conditionalEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'conditional-rules-gallery'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, conditionalEnUS) },
    presets: [
      UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }),
      UniverSheetsConditionalFormattingPreset(),
    ],
  })
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  for (const id of ['numbers', 'text', 'duplicates', 'formula']) {
    const sheet = workbook.getSheetBySheetId(id)!
    const builder = sheet.newConditionalFormattingRule()
    const rule =
      id === 'numbers'
        ? builder.whenNumberGreaterThan(8).setBackground('#FDE3B6')
        : id === 'text'
          ? builder.whenTextContains('Check').setBackground('#D8EEF5')
          : id === 'duplicates'
            ? builder.setDuplicateValues().setBackground('#F5DCE6')
            : builder.whenFormulaSatisfied('=$B5<$C5').setBackground('#CDEDE3')
    sheet.addConditionalFormattingRule(
      rule.setRanges([sheet.getRange(id === 'formula' ? 'A5:C10' : 'B5:B10').getRange()]).build(),
    )
  }
  workbook.getActiveSheet()!.getRange('B6').activate()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      try {
        univer.dispose()
      } finally {
        root.remove()
      }
    },
  }
}
