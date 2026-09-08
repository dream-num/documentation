import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'north-typesetting'
  container.append(root)
  const locale = LocaleType.EN_US
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: docsCoreEnUS },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true })],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && root.dataset.ready !== 'error' && stage === univerAPI.Enum.LifecycleStages.Rendered)
      root.dataset.ready = 'true'
  })
  try {
    univerAPI.createDocument(createData())
  } catch (cause) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent = 'Document startup failed: ' + (cause instanceof Error ? cause.message : String(cause))
    root.append(alert)
    console.error(cause)
  }
  return {
    univerAPI,
    dispose() {
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
