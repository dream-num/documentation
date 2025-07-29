import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverWatermarkPlugin } from '@univerjs/watermark'
import { DOCUMENT_DATA } from './data'
import './styles.css'

import '@univerjs/preset-docs-core/lib/index.css'

import '@univerjs/watermark/facade'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      docsCoreEnUS,
    ),
  },
  presets: [
    UniverDocsCorePreset({
      container: 'app',
    }),
  ],
  plugins: [
    [UniverWatermarkPlugin, {
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
    }],
  ],
})

univerAPI.createWorkbook(DOCUMENT_DATA)
