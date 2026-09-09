import type { IDocumentData, IParagraph, ITextRun } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
export const FONTS = [
  { id: 'sans', label: 'Arial / sans-serif', family: 'Arial, sans-serif', probe: 'Arial' },
  { id: 'serif', label: 'Georgia / serif', family: 'Georgia, serif', probe: 'Georgia' },
  { id: 'mono', label: 'Courier New / monospace', family: 'Courier New, monospace', probe: 'Courier New' },
  {
    id: 'missing',
    label: 'Missing primary / Georgia / serif',
    family: 'Univer Missing Font 2027, Georgia, serif',
    probe: 'Univer Missing Font 2027',
  },
] as const
export const SAMPLES = [
  { id: 'EN', label: 'Latin', text: 'Widen the archive: minimum, maximum, office, affinity. 0123456789.' },
  { id: 'CJK', label: 'CJK', text: '档案字体测试：清晰阅读。日本語の文字。한글 글꼴 비교.' },
  { id: 'RTL', label: 'Arabic / Hebrew', text: 'مرحبا بالعالم — שלום עולם — 2027' },
  { id: 'ACCENTS', label: 'Accents', text: 'Crème brûlée · Straße · Łódź · São Tomé · naïve · Ångström.' },
  { id: 'SYMBOL', label: 'Symbols', text: 'α β Ω ∑ ∫ ≠ ≤ ≥ → ↔ © ® ™ € £ ¥ ± × ÷' },
  {
    id: 'GLYPH',
    label: 'Private-use glyph',
    text: 'Unassigned private-use sample U+10FFFD: \u{10FFFD} (no universal glyph is expected).',
  },
] as const
export function createData(empty = false, _legacyChinese = false): IDocumentData {
  const rows: {
    text: string
    heading?: boolean
    page?: boolean
    sample?: boolean
    family?: string
    size?: number
    bold?: boolean
  }[] = empty
    ? [{ text: '' }]
    : [
        { text: 'Type specimens / Font families', heading: true },
        {
          text: 'Select text and change family, size or weight in the native ribbon.',
        },
        ...FONTS.flatMap((font) => [
          { text: font.label, bold: true },
          { text: 'Minimum / Maximum / Office 0123456789', family: font.family, size: 17 },
          { text: 'Regular 12 pt / AVATAR ffi fi fl', family: font.family, size: 12 },
          { text: 'Bold 18 pt / AVATAR ffi fi fl', family: font.family, size: 18, bold: true },
        ]),
        {
          text: 'The final stack requests an absent primary and explicit fallback, not a verified per-glyph font.',
        },
        { text: 'Scripts and glyph boundaries', heading: true, page: true },
        ...SAMPLES.map((sample) => ({ text: `[${sample.id}] ${sample.text}`, sample: true })),
        { text: 'Composed / decomposed: é / e\u0301 · å / a\u030a · ö / o\u0308 · ç / c\u0327' },
        {
          text: 'Inspect RTL joining, direction and selection per platform. Private-use characters have no universal expected glyph.',
        },
        {
          text: 'No font downloads or glyph-coverage claims. Native font-size edits may repaginate these specimens.',
        },
      ]
  const paragraphs: IParagraph[] = [],
    textRuns: ITextRun[] = []
  let start = 0
  for (const [index, row] of rows.entries()) {
    const end = start + row.text.length
    const style = {
      ff: row.family ?? FONTS[0].family,
      fs: row.heading ? 24 : (row.size ?? (row.sample ? 14 : 11)),
      bl: row.heading || row.bold ? BooleanNumber.TRUE : BooleanNumber.FALSE,
    }
    paragraphs.push({
      startIndex: end,
      paragraphId: `para_alder_font_${index}`,
      paragraphStyle: {
        namedStyleType: row.heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        textStyle: style,
        pageBreakBefore: row.page ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        spaceBelow: { v: row.heading ? 14 : 8 },
        lineSpacing: 1.2,
      },
    })
    if (end > start) textRuns.push({ st: start, ed: end, ts: style })
    start = end + 1
  }
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  return {
    id: 'alder-font-report',
    title: 'Fonts and glyph specimens',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 60,
      marginBottom: 60,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns,
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'alder-font-section' }],
    },
  }
}
