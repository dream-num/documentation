import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'
import tableEnUS from '@univerjs/preset-sheets-table/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-table/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'table-range-gallery'
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
      const workbook = univerAPI.getWorkbook('studio-table-ranges')!
      const expand = workbook.getSheetBySheetId('expand')!
      const expanded = await expand.addTable('Deliveries', expand.getRange('A4:C8').getRange(), 'deliveries', {
        tableStyleId: 'table-default-4',
      })
      if (disposed) return
      if (!expanded) throw new Error('Could not create Deliveries table')
      const shrink = workbook.getSheetBySheetId('shrink')!
      const shrunk = await shrink.addTable('Pigments', shrink.getRange('A4:C10').getRange(), 'pigments', {
        tableStyleId: 'table-default-2',
      })
      if (disposed) return
      if (!shrunk) throw new Error('Could not create Pigments table')
      workbook.setActiveSheet('expand')
      expand.getRange('A5').activate()
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
