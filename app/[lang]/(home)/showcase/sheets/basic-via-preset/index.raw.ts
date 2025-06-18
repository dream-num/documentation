import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import sheetsDrawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import sheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN'
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import sheetsHyperLinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import SheetsSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN'
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment'
import UniverPresetSheetsThreadCommentZhCN from '@univerjs/preset-sheets-thread-comment/locales/zh-CN'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightZhCN from '@univerjs/sheets-crosshair-highlight/locale/zh-CN'
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor'
import SheetsZenEditorZhCN from '@univerjs/sheets-zen-editor/locale/zh-CN'
import { UniverWatermarkPlugin } from '@univerjs/watermark'

import { WORKBOOK_DATA } from './data'

import './styles.css'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import '@univerjs/presets/lib/styles/preset-sheets-sort.css'
import '@univerjs/presets/lib/styles/preset-sheets-filter.css'
import '@univerjs/presets/lib/styles/preset-sheets-conditional-formatting.css'
import '@univerjs/presets/lib/styles/preset-sheets-data-validation.css'
import '@univerjs/presets/lib/styles/preset-sheets-drawing.css'
import '@univerjs/presets/lib/styles/preset-sheets-filter.css'
import '@univerjs/presets/lib/styles/preset-sheets-hyper-link.css'
import '@univerjs/presets/lib/styles/preset-sheets-find-replace.css'
import '@univerjs/presets/lib/styles/preset-sheets-thread-comment.css'
import '@univerjs/sheets-zen-editor/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.ZH_CN,
  locales: {
    [LocaleType.ZH_CN]: merge(
      {},
      sheetsCoreZhCN,
      SheetsSortZhCN,
      UniverPresetSheetsFilterZhCN,
      sheetsConditionalFormattingZhCN,
      sheetsDataValidationZhCN,
      UniverPresetSheetsFindReplaceZhCN,
      sheetsDrawingZhCN,
      sheetsFilterZhCN,
      sheetsHyperLinkZhCN,
      UniverPresetSheetsThreadCommentZhCN,
      SheetsCrosshairHighlightZhCN,
      SheetsZenEditorZhCN,
    ),
  },
  presets: [
    UniverSheetsCorePreset(),
    UniverSheetsFindReplacePreset(),
    UniverSheetsSortPreset(),
    UniverSheetsFilterPreset(),
    UniverSheetsConditionalFormattingPreset(),
    UniverSheetsDataValidationPreset(),
    UniverSheetsDrawingPreset(),
    UniverSheetsFilterPreset(),
    UniverSheetsHyperLinkPreset(),
    UniverSheetsThreadCommentPreset(),
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
    UniverSheetsCrosshairHighlightPlugin,
    UniverSheetsZenEditorPlugin,
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
