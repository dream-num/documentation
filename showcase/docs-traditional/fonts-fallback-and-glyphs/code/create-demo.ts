import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import EnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const locale = LocaleType.EN_US
  const root = document.createElement('div')
  root.className = 'font-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: EnUS },
    presets: [UniverDocsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  let disposed = false
  try {
    const doc = univerAPI.createDocument(createData(false))
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return {
      univerAPI,
      doc,
      dispose() {
        if (disposed) return
        disposed = true
        if (owner.univerAPI === univerAPI) delete owner.univerAPI
        univer.dispose()
        root.remove()
      },
    }
  } catch (error) {
    univer.dispose()
    root.remove()
    throw error
  }
}
