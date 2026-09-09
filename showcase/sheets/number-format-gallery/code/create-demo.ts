import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LifecycleStages, LocaleType } from '@univerjs/presets'

import { createWorkbookData, FORMAT_SAMPLES } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'number-format-gallery'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: coreEnUS },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  let initialized = false
  let disposed = false
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    initialized = true
    const sheet = univerAPI.getWorkbook('number-format-gallery')!.getActiveSheet()!
    FORMAT_SAMPLES.forEach((sample, index) => sheet.getRange(`C${index + 5}`).setNumberFormat(sample.pattern))
    sheet.getRange('C5').activate()
    root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  univerAPI.createWorkbook(createWorkbookData())
  initialize()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
