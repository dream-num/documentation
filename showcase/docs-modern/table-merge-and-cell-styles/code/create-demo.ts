import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import coreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, ROWS } from './data'

import '@univerjs-pro/docs-table-ui/lib/index.css'
import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-table/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'table-merge-and-cell-styles'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, TableEnUS) },
      presets: [
        UniverDocsCorePreset({ container: root, ribbonType: 'grid', header: true, toolbar: true, footer: true }),
      ],
      plugins: [UniverLicensePlugin, UniverDocsTablePlugin, UniverDocsTableUIPlugin],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    const doc = univerAPI.createDocument(createData())
    for (const id of ['merged', 'baseline']) {
      const anchor = doc.findParagraphs({ paragraphId: id + '-anchor' })[0]
      const table = doc.insertTableFromData(
        ROWS.map((row) => row.slice()),
        {
          tableId: id,
          offset: anchor.getRange().startOffset,
          columnWidths: [200, 220, 180],
          width: 600,
          headerRowCount: 0,
        },
      )
      if (!table) throw new Error('Table insertion rejected')
      if (!table.setCellBackground(table.getRowRange(0), '#EEE5F3')) throw new Error('Cell fill rejected')
      if (
        !table.setBorder(table.getRowRange(1), {
          preset: univerAPI.Enum.DocsTableBorderPreset.Bottom,
          color: '#836494',
          width: 2,
        })
      )
        throw new Error('Cell border rejected')
      if (id === 'merged') {
        if (!table.getCell(0, 0)?.mergeTo(1, 3)) throw new Error('Horizontal merge rejected')
        if (!table.getCell(2, 0)?.mergeTo(2, 1)) throw new Error('Vertical merge rejected')
      }
      const cell = table.getCell(0, 0)?.getContentRange()
      if (cell)
        for (const paragraph of doc.getParagraphs()) {
          const range = paragraph.getRange()
          if (range.startOffset >= cell.startOffset && range.endOffset <= cell.endOffset) {
            if (!paragraph.setStyle({ horizontalAlign: univerAPI.Enum.HorizontalAlign.CENTER }))
              throw new Error('Cell alignment rejected')
          }
        }
    }
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Table merge demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
