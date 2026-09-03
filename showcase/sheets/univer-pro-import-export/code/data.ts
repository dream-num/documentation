import type { IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'univer-pro-import-export-showcase',
  name: 'Univer SDK Pro Import Export Showcase',
  sheetOrder: ['overview'],
  sheets: {
    overview: {
      id: 'overview',
      name: 'Overview',
      rowCount: 18,
      columnCount: 8,
      cellData: {
        0: {
          0: { v: 'Task' },
          1: { v: 'Endpoint' },
          2: { v: 'Notes' },
        },
        1: {
          0: { v: 'Upload source file' },
          1: { v: '/universer-api/stream/file/upload' },
          2: { v: 'Local development uses the documentation site as a same-origin proxy.' },
        },
        2: {
          0: { v: 'Create import/export task' },
          1: { v: '/universer-api/exchange/{type}/import|export' },
          2: { v: 'The showcase only keeps the exchange-client flow.' },
        },
        3: {
          0: { v: 'Poll task status' },
          1: { v: '/universer-api/exchange/task/{taskID}' },
          2: { v: 'The client waits for the backend task to finish before reading the result.' },
        },
        4: {
          0: { v: 'Resolve signed download url' },
          1: { v: '/universer-api/file/{fileID}/sign-url' },
          2: { v: 'Localhost rewrites this step to a same-origin download route to avoid OSS CORS.' },
        },
        5: {
          0: { v: 'Download exported file' },
          1: { v: '/api/exchange/file/{fileID}/download' },
          2: { v: 'The browser now downloads from the local site instead of requesting OSS directly.' },
        },
        6: {
          0: { v: 'Current scope' },
          1: { v: 'Sheets import/export only' },
          2: { v: 'Sparkline and chart have been removed from this showcase.' },
        },
        8: {
          0: { v: 'Use the File menu to import or export a workbook through the configured exchange endpoints.' },
        },
        9: {
          0: { v: 'This page is intentionally focused on the import/export pipeline and its local proxy behavior.' },
        },
      },
    },
  },
  locale: LocaleType.EN_US,
}
