import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'
import tableEnUS from '@univerjs/preset-sheets-table/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData, THEMES } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-table/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'table-style-gallery'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, tableEnUS) },
      presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsTablePreset()],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  let initialized = false
  let disposed = false
  let lifecycle: { dispose(): void } | undefined
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  const dispose = () => {
    if (disposed) return
    disposed = true
    const errors: unknown[] = []
    try {
      lifecycle?.dispose()
    } catch (error) {
      errors.push(error)
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } catch (error) {
      errors.push(error)
    }
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Table demo cleanup failed')
  }
  const cleanupFailure = (error: unknown) => {
    try {
      dispose()
    } catch (cleanupError) {
      return new AggregateError([error, cleanupError], 'Table demo initialization and cleanup failed', { cause: error })
    }
    return error
  }
  const initialize = async () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady) return
    initialized = true
    try {
      const workbook = univerAPI.getWorkbook('table-style-lab')!
      await Promise.all(
        Object.entries(THEMES).flatMap(([sheetId, entries]) => {
          const sheet = workbook.getSheetBySheetId(sheetId)!
          return entries.map(async (theme, index) => {
            if (disposed) return
            const tableId = `${sheetId}-${index}`
            const success = await sheet.addTable(
              tableId.replaceAll('-', '_'),
              sheet.getRange(index ? 'F4:I10' : 'A4:D10').getRange(),
              tableId,
              {
                tableStyleId: sheetId === 'defaults' ? `table-default-${index ? 5 : 0}` : 'table-default-0',
              },
            )
            if (disposed) return
            if (!success) throw new Error(`Could not create ${tableId}`)
            if (theme && !(await sheet.addTableTheme(tableId, theme))) throw new Error(`Could not style ${tableId}`)
          })
        }),
      )
      if (disposed) return
      workbook.setActiveSheet('rows')
      workbook.getActiveSheet()!.getRange('A5').activate()
      root.dataset.ready = 'true'
    } catch (error) {
      if (!disposed) console.error(cleanupFailure(error))
    }
  }
  try {
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, () => {
      void initialize()
    })
    univerAPI.createWorkbook(createWorkbookData())
    owner.univerAPI = univerAPI
    void initialize()
    return { univerAPI, dispose }
  } catch (error) {
    throw cleanupFailure(error)
  }
}
