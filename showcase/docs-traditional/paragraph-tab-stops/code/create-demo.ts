import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import coreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'paragraph-tab-stops'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: coreEnUS },
      presets: [
        UniverDocsCorePreset({ container: root, ribbonType: 'grid', header: true, toolbar: true, footer: true }),
      ],
      plugins: [UniverLicensePlugin],
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
    univerAPI.createDocument(createData())
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Paragraph tab stops demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
