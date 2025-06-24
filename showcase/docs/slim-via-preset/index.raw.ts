import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { DOCUMENT_DATA } from './data'

import './styles.css'

import '@univerjs/preset-docs-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.ZH_CN,
  locales: {
    [LocaleType.ZH_CN]: merge(
      {},
      docsCoreZhCN,
    ),
  },
  presets: [
    UniverDocsCorePreset(),
  ],
})

univerAPI.createUniverDoc(DOCUMENT_DATA)
