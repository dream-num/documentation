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
  root.className = 'conditional-format-priority'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, conditionalEnUS) },
      presets: [
        UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }),
        UniverSheetsConditionalFormattingPreset(),
      ],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    const workbook = univerAPI.createWorkbook(createWorkbookData())
    for (const id of ['priority', 'merge', 'stop']) {
      const sheet = workbook.getSheetBySheetId(id)!
      const ranges = [sheet.getRange('B5:B10').getRange()]
      const low = (
        id === 'priority'
          ? sheet.newConditionalFormattingRule().whenNumberGreaterThan(50).setBackground('#FEF3C7')
          : sheet.newConditionalFormattingRule().whenNumberGreaterThan(50).setFontColor('#9F1239')
      )
        .setRanges(ranges)
        .build()
      const high = sheet
        .newConditionalFormattingRule()
        .whenNumberGreaterThan(80)
        .setBackground('#CCFBF1')
        .setRanges(ranges)
        .build()
      sheet.addConditionalFormattingRule({ ...low, cfId: `${id}-low` })
      sheet.addConditionalFormattingRule({ ...high, cfId: `${id}-high`, stopIfTrue: id === 'stop' })
      sheet.moveConditionalFormattingRule(`${id}-high`, `${id}-low`, 'before')
    }
    workbook.getActiveSheet()!.getRange('B5').activate()
    root.dataset.ready = 'true'
    owner.univerAPI = univerAPI
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Conditional priority demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
