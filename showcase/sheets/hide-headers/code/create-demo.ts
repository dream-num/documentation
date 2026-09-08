import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'sheets-hide-headers-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root })],
  })
  const demoWindow = window as Window & { univerAPI?: typeof univerAPI }
  demoWindow.univerAPI = univerAPI
  const ready = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  let disposed = false
  return {
    univerAPI,
    dispose: () => {
      if (disposed) return
      disposed = true
      ready.dispose()
      if (demoWindow.univerAPI === univerAPI) delete demoWindow.univerAPI
      root.remove()
      univer.dispose()
    },
  }
}
