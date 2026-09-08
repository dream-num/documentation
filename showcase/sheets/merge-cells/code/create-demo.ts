import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'merge-cells-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) root.dataset.ready = 'true'
  })
  univerAPI.createWorkbook(createWorkbookData())
  const scope = window as Window & { univerAPI?: typeof univerAPI }
  scope.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (scope.univerAPI === univerAPI) delete scope.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
