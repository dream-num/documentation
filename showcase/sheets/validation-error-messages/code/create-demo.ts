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
  root.className = 'validation-messages-gallery'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, validationEnUS) },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsDataValidationPreset()],
  })
  let initialized = false
  let disposed = false
  let lifecycle: { dispose(): void } | undefined
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      lifecycle?.dispose()
    } finally {
      try {
        univer.dispose()
      } finally {
        root.remove()
      }
    }
  }
  const fail = (error: unknown): never => {
    try {
      dispose()
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Validation startup and cleanup failed', { cause: cleanup })
    }
    throw error
  }
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady) return
    initialized = true
    try {
      const workbook = univerAPI.getWorkbook('crate-validation-messages')!
      for (const id of ['reject', 'warning', 'default']) {
        workbook
          .getSheetBySheetId(id)!
          .getRange('B5:B10')
          .setDataValidation(
            univerAPI
              .newDataValidation()
              .requireNumberBetween(1, 6, true)
              .setAllowBlank(true)
              .setAllowInvalid(id !== 'reject')
              .setOptions({
                showErrorMessage: id !== 'default',
                error:
                  id === 'reject'
                    ? 'Each packing allocation needs 1–6 whole crates. Re-enter a supported count.'
                    : 'This draft count is outside 1–6 whole crates. Please review it before packing.',
              })
              .build(),
          )
      }
      workbook.getActiveSheet()!.getRange('B5').activate()
      root.dataset.ready = 'true'
    } catch (error) {
      fail(error)
    }
  }
  try {
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
    univerAPI.createWorkbook(createWorkbookData())
    initialize()
    owner.univerAPI = univerAPI
    return { univerAPI, dispose }
  } catch (error) {
    return fail(error)
  }
}
