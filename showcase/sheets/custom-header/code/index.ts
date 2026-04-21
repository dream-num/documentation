import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
  if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
    const workbook = univerAPI.getActiveWorkbook()
    if (!workbook) return

    const worksheet = workbook.getActiveSheet()
    if (!worksheet) return

    worksheet.customizeColumnHeader({
      headerStyle: {
        fontColor: '#fff',
        backgroundColor: '#4e69ee',
        fontSize: 12,
      },
      columnsCfg: {
        0: 'Name',
        1: 'Age',
        2: 'Department',
        3: {
          text: 'Salary',
          textAlign: 'right',
          fontColor: '#ffe082',
        },
      },
    })

    worksheet.customizeRowHeader({
      headerStyle: {
        backgroundColor: '#f3f4f6',
        fontSize: 11,
      },
      rowsCfg: {
        0: 'Header',
        1: 'Row 1',
        2: 'Row 2',
        3: {
          text: 'Row 3',
          textAlign: 'left',
          fontColor: '#ef4444',
        },
      },
    })
  }
})
