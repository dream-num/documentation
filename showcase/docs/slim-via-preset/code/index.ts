import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { DOCUMENT_DATA } from './data'

import './styles.css'

import '@univerjs/preset-docs-core/lib/index.css'

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
})

univerAPI.createUniverDoc(DOCUMENT_DATA)
