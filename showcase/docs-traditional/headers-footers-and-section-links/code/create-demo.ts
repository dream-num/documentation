import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import EnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'header-footer-gallery'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: EnUS },
    presets: [UniverDocsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  let disposed = false
  try {
    const doc = univerAPI.createDocument({
      ...createData(),
      documentStyle: {
        documentFlavor: univerAPI.Enum.DocumentFlavor.TRADITIONAL,
        pageSize: { width: 600, height: 500 },
        marginTop: 80,
        marginBottom: 80,
        marginLeft: 60,
        marginRight: 60,
      },
    })
    const boundary = doc.findParagraphs({ paragraphId: 'leaf-3' })[0]
    if (
      !boundary ||
      !doc.insertSectionBreak(boundary.getInfo().startOffset, { nextSectionType: univerAPI.Enum.SectionType.NEXT_PAGE })
    )
      throw new Error('Section creation rejected')
    const sections = doc.getSections()
    for (const section of sections) {
      if (
        !section.setHeaderFooterOptions({
          useFirstPageHeaderFooter: univerAPI.Enum.BooleanNumber.TRUE,
          evenAndOddHeaders: univerAPI.Enum.BooleanNumber.TRUE,
          marginHeader: 28,
          marginFooter: 28,
        })
      )
        throw new Error('Header/footer options rejected')
    }
    for (const variant of ['default', 'first', 'even'] as const) {
      doc.insertText(0, `FIELD NOTES / ${variant.toUpperCase()}`, sections[0].ensureHeader(variant))
      doc.insertText(0, `ARCHIVE COPY / ${variant.toUpperCase()}`, sections[0].ensureFooter(variant))
      if (
        (!sections[1].isHeaderLinkedToPrevious(variant) && !sections[1].setHeaderLinkedToPrevious(true, variant)) ||
        (!sections[1].isFooterLinkedToPrevious(variant) && !sections[1].setFooterLinkedToPrevious(true, variant))
      )
        throw new Error('Section linking rejected')
    }
    if (!sections[1].setHeaderLinkedToPrevious(false, 'default')) throw new Error('Header unlink rejected')
    doc.insertText(0, 'LOCAL / ', sections[1].getHeaderId('default')!)
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return {
      univerAPI,
      doc,
      dispose() {
        if (disposed) return
        disposed = true
        if (owner.univerAPI === univerAPI) delete owner.univerAPI
        try {
          univer.dispose()
        } finally {
          root.remove()
        }
      },
    }
  } catch (error) {
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
    throw error
  }
}
