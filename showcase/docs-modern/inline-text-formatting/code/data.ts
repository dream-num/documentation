import type { IDocumentData, ITextStyle } from '@univerjs/core'
import { DocumentFlavor, NamedStyleType } from '@univerjs/core'

export function createData(): IDocumentData {
  const lines = [
    'Small details, clear meaning',
    'Inline text formatting',
    'Emphasis: a bold decision, an italic aside, and an ordinary sentence.',
    'Color: Ready to publish stands apart from the supporting text.',
    'Highlight: confirm the venue before sending the invitation.',
    'Revision: replace the old wording with a clearer replacement.',
    'Underline: keep this phrase visible without changing its neighbors.',
    'Combined: the final approval uses color, bold and underline together.',
    'Try it: select any phrase and use the native formatting controls. Edit this sentence freely.',
  ]
  const dataStream = lines.join('\r') + '\r\n'
  const samples: [string, ITextStyle][] = [
    ['bold decision', { bl: 1 }],
    ['italic aside', { it: 1 }],
    ['Ready to publish', { cl: { rgb: '#047857' }, bl: 1 }],
    ['confirm the venue', { bg: { rgb: '#FEF08A' } }],
    ['old wording', { st: { s: 1 }, cl: { rgb: '#9A3412' } }],
    ['clearer replacement', { cl: { rgb: '#1D4ED8' } }],
    ['keep this phrase visible', { ul: { s: 1 } }],
    ['final approval', { bl: 1, ul: { s: 1 }, cl: { rgb: '#7C3AED' } }],
  ]
  let offset = 0
  return {
    id: 'modern-inline-text-formatting',
    title: 'Inline text formatting',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 850, height: 1123 },
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 48,
      marginRight: 48,
    },
    body: {
      dataStream,
      textRuns: samples.map(([text, ts]) => {
        const st = dataStream.indexOf(text)
        return { st, ed: st + text.length, ts }
      }),
      paragraphs: lines.map((text, index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'inline-paragraph-' + index,
          paragraphStyle: {
            namedStyleType: index === 0 ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: 0 },
            spaceBelow: { v: index < 2 ? 18 : 24 },
            lineSpacing: 1.3,
            textStyle: { fs: index === 0 ? 26 : 15, bl: index === 0 ? 1 : 0 },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'inline-section' }],
    },
  }
}
