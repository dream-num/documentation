import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IUndoRedoService } from '@univerjs/core'
import { DocStateChangeManagerService } from '@univerjs/docs'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, LAYOUTS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs-pro/docs-column-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-column/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'columns-demo'
  container.append(root)
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, ColumnEnUS),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true })],
    plugins: [UniverLicensePlugin, UniverDocsColumnPlugin, UniverDocsColumnUIPlugin],
  })
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api
  let disposed = false
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (disposed || stage !== api.Enum.LifecycleStages.Rendered) return
    try {
      for (const layout of LAYOUTS) {
        // Resolve each anchor after earlier insertions have changed document offsets.
        const anchor = doc.getParagraphs().find((paragraph) => paragraph.getId() === layout.id + '-anchor')
        if (!anchor) throw new Error('Column anchor is absent: ' + layout.id)
        const group = doc.insertColumnGroup(layout.ratios.length, {
          columnGroupId: layout.id,
          columnIds: layout.ratios.map((_ratio, index) => layout.id + '-' + index),
          offset: anchor.getRange().startOffset,
          widthRatios: [...layout.ratios],
          gap: 16,
        })
        if (!group) throw new Error('Could not insert column group: ' + layout.id)
        for (let index = 0; index < layout.ratios.length; index++) {
          const text = 'Column ' + (index + 1) + '\rShort editable text.'
          if (!group.getColumn(index)?.setText(text)) throw new Error('Could not fill column: ' + index)
        }
      }
      const injector = univer.__getInjector()
      injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
      injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
      // Filling columns moves the native caret; open the gallery at its title.
      doc.setSelection(0, 0)
      root.dataset.ready = 'true'
    } catch (cause) {
      root.dataset.ready = 'error'
      const alert = document.createElement('p')
      alert.role = 'alert'
      alert.textContent = 'Column startup failed: ' + (cause instanceof Error ? cause.message : String(cause))
      root.append(alert)
      console.error(cause)
    }
  })
  const doc = api.createDocument(createData())
  return {
    univerAPI: api,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
