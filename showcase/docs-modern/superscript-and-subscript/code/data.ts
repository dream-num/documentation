import type { IDocumentData, ITextStyle } from '@univerjs/core'
import { BaselineOffset, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export function createData(): IDocumentData {
  const lines = [
    'Small characters, different positions',
    'Native superscript and subscript',
    'Compare: baseline x2, raised x2, lowered x2.',
    'Chemistry: H2O and CO2 keep their element symbols on the baseline.',
    'Powers: a2 + b2 = c2 uses raised exponents, not special characters.',
    'Ordinal: the 1st result uses a raised suffix within ordinary text.',
    'Combined: N0 uses a colored, bold subscript with its own font size.',
    'Try it: edit this sentence freely. Select a styled digit to change its position.',
  ]
  const dataStream = lines.join('\r') + '\r\n'
  const samples: [string, number, number, ITextStyle][] = [
    ['baseline x2', 10, 1, { va: BaselineOffset.NORMAL }],
    ['raised x2', 8, 1, { va: BaselineOffset.SUPERSCRIPT }],
    ['lowered x2', 9, 1, { va: BaselineOffset.SUBSCRIPT }],
    ['H2O', 1, 1, { va: BaselineOffset.SUBSCRIPT }],
    ['CO2', 2, 1, { va: BaselineOffset.SUBSCRIPT }],
    ['a2 + b2 = c2', 1, 1, { va: BaselineOffset.SUPERSCRIPT }],
    ['a2 + b2 = c2', 6, 1, { va: BaselineOffset.SUPERSCRIPT }],
    ['a2 + b2 = c2', 11, 1, { va: BaselineOffset.SUPERSCRIPT }],
    ['1st result', 1, 2, { va: BaselineOffset.SUPERSCRIPT }],
    ['N0 uses', 1, 1, { va: BaselineOffset.SUBSCRIPT, cl: { rgb: '#B45309' }, bl: 1, fs: 20 }],
  ]
  let offset = 0
  return {
    id: 'modern-superscript-and-subscript',
    title: 'Superscript and subscript',
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
      textRuns: samples.map(([phrase, delta, length, ts]) => {
        const st = dataStream.indexOf(phrase) + delta
        return { st, ed: st + length, ts }
      }),
      paragraphs: lines.map((text, index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'baseline-paragraph-' + index,
          paragraphStyle: {
            namedStyleType: index === 0 ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: 0 },
            spaceBelow: { v: index < 2 ? 18 : 28 },
            lineSpacing: 1.3,
            textStyle: { fs: index === 0 ? 25 : 15, bl: index === 0 ? 1 : 0 },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'baseline-section' }],
    },
  }
}
