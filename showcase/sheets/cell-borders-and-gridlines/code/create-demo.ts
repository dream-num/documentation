import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'cell-borders-and-gridlines'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: coreEnUS },
      presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
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
    const { BorderType, BorderStyleTypes } = univerAPI.Enum
    for (const sheet of workbook.getSheets()) {
      sheet.getRange('B5:D8').setBorder(BorderType.OUTSIDE, BorderStyleTypes.MEDIUM, '#B45309')
      sheet.getRange('F5:H8').setBorder(BorderType.ALL, BorderStyleTypes.THIN, '#334155')
      sheet.getRange('B13:D16').setBorder(BorderType.HORIZONTAL, BorderStyleTypes.DASHED, '#0F766E')
      sheet.getRange('F13:H16').setBorder(BorderType.OUTSIDE, BorderStyleTypes.DOUBLE, '#7C3AED')
      sheet.getRange('F16:H16').setBorder(BorderType.TOP, BorderStyleTypes.DOUBLE, '#7C3AED')
      sheet.setHiddenGridlines(sheet.getSheetId() === 'clean')
    }
    workbook.getActiveSheet()!.getRange('B5:D8').activate()
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Preserve both initialization and cleanup errors.
      throw new AggregateError([error, cleanupError], 'Cell borders demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
