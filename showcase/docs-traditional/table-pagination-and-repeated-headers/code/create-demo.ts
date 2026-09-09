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
  root.className = 'table-pagination-and-repeated-headers'
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
    for (const [id, headers] of [
      ['two', 2],
      ['one', 1],
      ['none', 0],
    ] as const) {
      const anchor = doc.findParagraphs({ paragraphId: id + '-anchor' })[0]
      const table = doc.insertTableFromData(
        ROWS.map((row) => row.slice()),
        {
          tableId: id,
          offset: anchor.getRange().startOffset,
          columnWidths: [235, 150, 175],
          width: 560,
          headerRowCount: headers,
        },
      )
      if (!table) throw new Error('Table insertion rejected')
      if (!table.setCellBackground(table.getRowRange(0), '#E2ECE8')) throw new Error('Header fill rejected')
      if (!table.setCellBackground(table.getRowRange(1), '#F0F5F2')) throw new Error('Subheader fill rejected')
    }
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Table pagination demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
