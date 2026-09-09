import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'cell-rich-text'
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
    const sheet = workbook.getActiveSheet()!
    sheet.getRange('B5').setRichTextValueForCell(
      univerAPI
        .newRichText()
        .insertText('Status: ')
        .insertText('Ready', { bl: 1, cl: { rgb: '#047857' } })
        .insertText(' for review', { it: 1 }),
    )
    sheet.getRange('B7').setRichTextValueForCell(
      univerAPI
        .newRichText()
        .insertText('Notebook', { ff: 'Georgia', fs: 18 })
        .insertText(' / ')
        .insertText('SKU-204', { ff: 'Courier New', cl: { rgb: '#1D4ED8' } })
        .insertText(' / Edition 02', { ff: 'Arial' }),
    )
    sheet.getRange('B9').setRichTextValueForCell(
      univerAPI
        .newRichText()
        .insertText('Old title', { st: { s: 1 }, cl: { rgb: '#9A3412' } })
        .insertText(' -> ')
        .insertText('New title', { ul: { s: 1 }, bl: 1 }),
    )
    sheet.getRange('B11').setRichTextValueForCell(
      univerAPI
        .newRichText()
        .insertText('Field notes\r', { bl: 1, fs: 16, cl: { rgb: '#6D28D9' } })
        .insertText('Bring a pencil and a small notebook.', { it: 1 }),
    )
    sheet.getRange('B5').activate()
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Cell rich text demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
