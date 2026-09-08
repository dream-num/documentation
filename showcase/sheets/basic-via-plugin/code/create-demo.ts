import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import EngineFormulaEnUS from '@univerjs/engine-formula/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US'
import SheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import SheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import SheetsFilterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import SheetsHyperLinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui'
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
import '@univerjs/sheets-thread-comment-ui/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'

import '@univerjs/sheets/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'basic-plugin-editor'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        EngineFormulaEnUS,
        SheetsFormulaEnUS,
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        SheetsFormulaUIEnUS,
        SheetsNumfmtUIEnUS,
        SheetsFilterEnUS,
        SheetsConditionalFormattingEnUS,
        SheetsDataValidationEnUS,
        SheetsSortUIEnUS,
        FindReplaceEnUS,
        ThreadCommentUIEnUS,
        SheetsThreadCommentUIEnUS,
        SheetsNoteUIEnUS,
        SheetsHyperLinkEnUS,
        SheetsTableUIEnUS,
        SheetsCrosshairHighlightEnUS,
      ),
    },
  })

  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverFormulaEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, { ribbonType: 'grid', container: root })
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
  const univerAPI = FUniver.newAPI(univer)
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) root.dataset.ready = 'true'
  })
  univer.createUnit(UniverInstanceType.UNIVER_SHEET, structuredClone(WORKBOOK_DATA))
  const owner = window as Window & { univerAPI?: FUniver }
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
