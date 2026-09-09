import { BooleanNumber, type IParagraphStyle } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import EnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { BASE_RULES, BREAK_SPECIMENS, PARAGRAPHS, VARIANTS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const locale = LocaleType.EN_US
  const root = document.createElement('div')
  root.className = 'pagination-demo'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale,
      locales: { [LocaleType.EN_US]: EnUS },
      presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as Window & { univerAPI?: typeof univerAPI }
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
    const prefix = [
      { text: 'Page and section breaks', id: 'break-lab-title', title: true, first: true, spacer: 12 },
      {
        text: 'Initially: this opening block and the continuous section share one page.',
        id: 'break-lab-intro',
        title: false,
        first: false,
        spacer: 12,
      },
      { text: BREAK_SPECIMENS[0].text, id: 'continuous', title: true, first: true, spacer: 12 },
      { text: 'Before the manual page break.', id: 'manual-before', title: false, first: false, spacer: 12 },
      { text: 'After the manual page break.', id: 'manual-after', title: true, first: true, spacer: 12 },
      ...BREAK_SPECIMENS.slice(1).map((s) => ({ text: s.text, id: s.id, title: true, first: true, spacer: 12 })),
    ]
    const rows = [
      ...prefix,
      ...VARIANTS.flatMap((variant) => [
        {
          text: '[' + variant.id + '] ' + variant.label,
          id: variant.id + '-title',
          title: true,
          first: false,
        },
        {
          text: 'Same text, page dimensions and lead-in space. Scroll to compare page breaks.',
          id: variant.id + '-spacer',
          spacer: variant.spacer ? variant.spacer : 245,
        },
        { text: '[' + variant.id + ':heading] Follow-up actions', id: variant.id + '-heading' },
        { text: PARAGRAPHS[4], id: variant.id + '-short' },
        { text: variant.oversized ? Array(8).fill(PARAGRAPHS[5]).join(' ') : PARAGRAPHS[5], id: variant.id + '-long' },
      ]),
    ]
    let offset = 0
    const paragraphs = rows.map((row) => {
      offset += row.text.length + 1
      const paragraphStyle: IParagraphStyle = {
        ...BASE_RULES,
        textStyle: { fs: row.title ? 18 : 11, ff: 'Arial', bl: row.title ? BooleanNumber.TRUE : BooleanNumber.FALSE },
        lineSpacing: 1.25,
        spaceBelow: { v: row.spacer ?? 12 },
        pageBreakBefore: row.title && !row.first ? BooleanNumber.TRUE : BooleanNumber.FALSE,
      }
      return { startIndex: offset - 1, paragraphId: row.id, paragraphStyle }
    })
    const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
    const doc = univerAPI.createDocument({
      id: 'pagination-rules-gallery',
      title: 'Pagination rule comparison',
      locale: LocaleType.EN_US,
      body: {
        dataStream,
        paragraphs,
        textRuns: [],
        sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'pagination-section' }],
      },
      documentStyle: {
        documentFlavor: univerAPI.Enum.DocumentFlavor.TRADITIONAL,
        pageSize: { width: 560, height: 480 },
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 48,
        marginRight: 48,
      },
    })
    for (const specimen of BREAK_SPECIMENS.toReversed()) {
      const paragraph = doc.findParagraphs({ paragraphId: specimen.id })[0]
      if (!doc.insertSectionBreak(paragraph.getRange().startOffset, { nextSectionType: specimen.type }))
        throw new Error('Section break rejected: ' + specimen.id)
    }
    if (!doc.insertText(doc.findParagraphs({ paragraphId: 'manual-after' })[0].getRange().startOffset, '\f'))
      throw new Error('Manual page break rejected')
    for (const variant of VARIANTS) {
      for (const [marker, style] of [
        ['heading', variant.heading],
        ['short', variant.body],
        ['long', variant.body],
      ] as const) {
        const paragraph = doc.findParagraphs({ paragraphId: variant.id + '-' + marker })[0]
        if (!paragraph?.setStyle(style)) throw new Error('The SDK rejected pagination rule: ' + variant.id)
      }
    }
    owner.univerAPI = univerAPI
    root.dataset.ready = 'true'
    return {
      univerAPI,
      doc,
      dispose,
    }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Pagination initialization and cleanup failed', {
        cause: cleanupError,
      })
    }
    throw error
  }
}
