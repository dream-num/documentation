import { LocaleType, merge, Univer, UniverInstanceType } from '@univerjs/core'
// import { FUniver } from '@univerjs/core/facade'
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FindReplaceZhCN from '@univerjs/find-replace/locale/zh-CN'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui'
import SheetsConditionalFormattingUIZhCN from '@univerjs/sheets-conditional-formatting-ui/locale/zh-CN'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightZhCN from '@univerjs/sheets-crosshair-highlight/locale/zh-CN'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import SheetsDataValidationUIZhCN from '@univerjs/sheets-data-validation-ui/locale/zh-CN'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import SheetsFilterUIZhCN from '@univerjs/sheets-filter-ui/locale/zh-CN'
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace'
import SheetsFindReplaceZhCN from '@univerjs/sheets-find-replace/locale/zh-CN'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIZhCN from '@univerjs/sheets-formula-ui/locale/zh-CN'
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui'
import SheetsHyperLinkUIZhCN from '@univerjs/sheets-hyper-link-ui/locale/zh-CN'
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui'
import SheetsNoteUIZhCN from '@univerjs/sheets-note-ui/locale/zh-CN'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIZhCN from '@univerjs/sheets-numfmt-ui/locale/zh-CN'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import SheetsSortUIZhCN from '@univerjs/sheets-sort-ui/locale/zh-CN'
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui'
import SheetsTableUIZhCN from '@univerjs/sheets-table-ui/locale/zh-CN'
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui'
import SheetsThreadCommentUIZhCN from '@univerjs/sheets-thread-comment-ui/locale/zh-CN'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN'
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor'
import SheetsZenEditorZhCN from '@univerjs/sheets-zen-editor/locale/zh-CN'
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN'
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui'
import ThreadCommentUIZhCN from '@univerjs/thread-comment-ui/locale/zh-CN'
import { UniverUIPlugin } from '@univerjs/ui'
import UIZhCN from '@univerjs/ui/locale/zh-CN'
import { UniverWatermarkPlugin } from '@univerjs/watermark'

import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'
import '@univerjs/sheets-filter-ui/lib/index.css'
import '@univerjs/find-replace/lib/index.css'
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css'
import '@univerjs/sheets-data-validation-ui/lib/index.css'
import '@univerjs/sheets-hyper-link-ui/lib/index.css'
import '@univerjs/sheets-note-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'
import '@univerjs/thread-comment-ui/lib/index.css'
import '@univerjs/sheets-zen-editor/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'

const univer = new Univer({
  locale: LocaleType.ZH_CN,
  locales: {
    [LocaleType.ZH_CN]: merge(
      {},
      DesignZhCN,
      UIZhCN,
      DocsUIZhCN,
      SheetsZhCN,
      SheetsUIZhCN,
      SheetsFormulaUIZhCN,
      SheetsNumfmtUIZhCN,
      SheetsFilterUIZhCN,
      SheetsConditionalFormattingUIZhCN,
      SheetsDataValidationUIZhCN,
      SheetsSortUIZhCN,
      FindReplaceZhCN,
      SheetsFindReplaceZhCN,
      ThreadCommentUIZhCN,
      SheetsThreadCommentUIZhCN,
      SheetsNoteUIZhCN,
      SheetsHyperLinkUIZhCN,
      SheetsTableUIZhCN,
      SheetsCrosshairHighlightZhCN,
      SheetsZenEditorZhCN,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)

univer.registerPlugin(UniverUIPlugin, {
  container: 'app',
})

univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)

univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)

univer.registerPlugin(UniverSheetsDataValidationPlugin)
univer.registerPlugin(UniverSheetsDataValidationUIPlugin)
univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin)
univer.registerPlugin(UniverSheetsFilterUIPlugin)
univer.registerPlugin(UniverSheetsSortUIPlugin)
univer.registerPlugin(UniverSheetsFindReplacePlugin)
univer.registerPlugin(UniverSheetsHyperLinkUIPlugin)
univer.registerPlugin(UniverThreadCommentUIPlugin)
univer.registerPlugin(UniverSheetsThreadCommentUIPlugin)
univer.registerPlugin(UniverSheetsTableUIPlugin)
univer.registerPlugin(UniverSheetsNoteUIPlugin)
univer.registerPlugin(UniverWatermarkPlugin, {
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
})
univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin)
univer.registerPlugin(UniverSheetsZenEditorPlugin)

univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)
