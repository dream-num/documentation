import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
// import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui'
import SheetsConditionalFormattingUIEnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import SheetsDataValidationUIEnUS from '@univerjs/sheets-data-validation-ui/locale/en-US'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import SheetsFilterUIEnUS from '@univerjs/sheets-filter-ui/locale/en-US'
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace'
import SheetsFindReplaceEnUS from '@univerjs/sheets-find-replace/locale/en-US'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui'
import SheetsHyperLinkUIEnUS from '@univerjs/sheets-hyper-link-ui/locale/en-US'
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui'
import SheetsNoteUIEnUS from '@univerjs/sheets-note-ui/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import SheetsSortUIEnUS from '@univerjs/sheets-sort-ui/locale/en-US'
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui'
import SheetsTableUIEnUS from '@univerjs/sheets-table-ui/locale/en-US'
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui'
import SheetsThreadCommentUIEnUS from '@univerjs/sheets-thread-comment-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor'
import SheetsZenEditorEnUS from '@univerjs/sheets-zen-editor/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui'
import ThreadCommentUIEnUS from '@univerjs/thread-comment-ui/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
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
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      UIEnUS,
      DocsUIEnUS,
      SheetsEnUS,
      SheetsUIEnUS,
      SheetsFormulaUIEnUS,
      SheetsNumfmtUIEnUS,
      SheetsFilterUIEnUS,
      SheetsConditionalFormattingUIEnUS,
      SheetsDataValidationUIEnUS,
      SheetsSortUIEnUS,
      FindReplaceEnUS,
      SheetsFindReplaceEnUS,
      ThreadCommentUIEnUS,
      SheetsThreadCommentUIEnUS,
      SheetsNoteUIEnUS,
      SheetsHyperLinkUIEnUS,
      SheetsTableUIEnUS,
      SheetsCrosshairHighlightEnUS,
      SheetsZenEditorEnUS,
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
