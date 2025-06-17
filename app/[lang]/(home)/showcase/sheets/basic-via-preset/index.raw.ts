import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/presets/lib/styles/preset-sheets-core.css'

const { univerAPI } = createUniver({
  locale: LocaleType.ZH_CN,
  locales: {
    [LocaleType.ZH_CN]: merge(
      {},
      sheetsCoreZhCN,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
