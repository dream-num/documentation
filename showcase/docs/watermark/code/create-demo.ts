import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverWatermarkPlugin } from '@univerjs/watermark'

import { DOCUMENT_DATA } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

import '@univerjs/watermark/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'docs-watermark-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(docsCoreEnUS) },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
    plugins: [
      [
        UniverWatermarkPlugin,
        {
          textWatermarkSettings: {
            content: 'Hello, Univer!',
            fontSize: 16,
            color: 'rgb(0,0,0)',
            bold: false,
            italic: false,
            direction: 'ltr',
            x: 60,
            y: 36,
            repeat: true,
            spacingX: 200,
            spacingY: 100,
            rotate: 0,
            opacity: 0.15,
          },
        },
      ],
    ],
  })

  const demoWindow = window as Window & { univerAPI?: typeof univerAPI }
  demoWindow.univerAPI = univerAPI
  const ready = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  univerAPI.createDocument(structuredClone(DOCUMENT_DATA))
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
