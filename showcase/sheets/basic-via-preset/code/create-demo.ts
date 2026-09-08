import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import UniverPresetSheetsFilterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import UniverPresetSheetsFindReplaceEnUS from '@univerjs/preset-sheets-find-replace/locales/en-US'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import sheetsHyperLinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import SheetsSortEnUS from '@univerjs/preset-sheets-sort/locales/en-US'
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment'
import UniverPresetSheetsThreadCommentEnUS from '@univerjs/preset-sheets-thread-comment/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import { UniverWatermarkPlugin } from '@univerjs/watermark'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-sort/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-hyper-link/lib/index.css'
import '@univerjs/preset-sheets-find-replace/lib/index.css'
import '@univerjs/preset-sheets-thread-comment/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'basic-preset-editor'
  root.dataset.ready = 'false'
  root.dataset.sdkReady = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        sheetsCoreEnUS,
        SheetsSortEnUS,
        UniverPresetSheetsFilterEnUS,
        sheetsConditionalFormattingEnUS,
        sheetsDataValidationEnUS,
        UniverPresetSheetsFindReplaceEnUS,
        sheetsDrawingEnUS,
        sheetsHyperLinkEnUS,
        UniverPresetSheetsThreadCommentEnUS,
        SheetsCrosshairHighlightEnUS,
      ),
    },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root }),
      UniverSheetsFindReplacePreset(),
      UniverSheetsSortPreset(),
      UniverSheetsFilterPreset(),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsDrawingPreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsThreadCommentPreset(),
    ],
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
      UniverSheetsCrosshairHighlightPlugin,
    ],
  })

  // Optional providers (including Find/Replace) initialize after the first paint.
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) {
      root.dataset.sdkReady = 'true'
      root.dataset.ready = 'true'
    }
  })
  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
