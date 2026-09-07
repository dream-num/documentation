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
export const CHAPTERS = [
  [
    '02 / Latin editorial text',
    'The municipal archive opens a new reading room in September. Its catalog must distinguish minimum from maximum, office from official, and item 1001 from item 1007.',
    'Compare serif and monospaced text without changing the words. A different line break is a measurable layout result, not necessarily a rendering error.',
    'Specimen: AVATAR Toffee office ffi fi fl — 001 010 100.',
  ],
  [
    '03 / Diacritics and names',
    'Contributor names retain their accents in the published report: Zoë, François, Łukasz, İpek, Søren and Nguyễn. Simplifying names to ASCII is not a font fallback strategy.',
    'Compare composed and decomposed examples visually. A visible accent is necessary but does not certify normalization, searching or text extraction.',
    'Specimen: é / e\u0301 · å / a\u030a · ö / o\u0308 · ç / c\u0327.',
  ],
  [
    '04 / Chinese, Japanese and Korean',
    '中文说明：字体回退不应更改原始文字。测试标点、数字和中西文混排。',
    '日本語：見出しと本文の字形を比較します。한국어: 본문과 숫자의 간격을 살펴봅니다.',
    'CJK fallback can come from different local fonts. This specimen reports the requested stack, not a verified identity for each drawn glyph.',
  ],
  [
    '05 / Right-to-left samples',
    'Arabic and Hebrew are included for visual inspection, not as a claim that every script direction, shaping cluster or selection gesture is supported.',
    'Arabic: العربية لغة جميلة. Hebrew: בדיקת גופנים במסמך. Mixed identifier: ARC-2027-14.',
    'Check reading order, joining, punctuation and selection in the native editor. A successful setTextStyle call alone proves none of these.',
  ],
  [
    '06 / Numerical comparison',
    'The acquisition register uses decimal totals, identifiers and aligned labels. The following native table is an independent reference when formatting report text.',
    '[TABLE] Acquisition register follows.',
    'Figures are fictional: 14 maps, 28 letters and 9 photographs. A monospaced font need not make every symbol or fallback glyph equal in width.',
  ],
  [
    '07 / Reference figure',
    'The figure explains baseline and cap-height terminology. It is embedded artwork, not a raster replacement for editable sample text.',
    '[FIGURE] Baseline reference follows.',
    'Changing the report font must leave this reference illustration intact. Use the sample rows on page 1 to inspect the actual native typography.',
  ],
  [
    '08 / Scientific symbols',
    'The conservation appendix uses Greek letters, operators and units as plain text. It does not claim mathematical layout or equation editing.',
    'Specimen: ΔT = 2.5 °C; λ = 550 nm; x ≤ 12; Ω ≠ 0; ∑ 1/n; ± 0.03.',
    'Inspect missing-symbol boxes and baseline alignment. Browser fallback can change glyph metrics even when the requested family string is unchanged.',
  ],
  [
    '09 / Missing glyph boundary',
    'Private-use code points have no universal appearance. A box, blank or local custom symbol can be legitimate evidence of missing or device-specific coverage.',
    'Boundary sample U+10FFFD: \u{10FFFD}. Emoji sample: 🧭 📚. Neither is silently replaced with an image by this demo.',
    'The host does not label a font as complete based on document.fonts.check or nonzero text width. Those checks cannot prove individual glyph coverage.',
  ],
  [
    '10 / Weight and size',
    'Compare regular and bold at 12 and 20 points. Font size is a SDK text-style value in points, not an outer CSS scale.',
    'A browser may synthesize a bold face when no matching weight is available. The local probe in this case checks the regular primary face only.',
    'Large type can increase the physical page count; the baseline has twelve authored chapter-page boundaries, not a promise that all variants stay twelve pages.',
  ],
  [
    '11 / Fallback policy',
    'Requested stack: primary family followed by an explicit generic fallback. The missing-primary variant adds Georgia before serif.',
    'A successful local FontFace load means this browser could resolve that face. It does not identify the fallback used by each glyph or prove cross-device equality.',
    'No proprietary font files are copied into this export. A deployer requiring fixed metrics must supply licensed fonts and run script-specific rendering acceptance.',
  ],
  [
    '12 / Review and source notes',
    'Acceptance checklist: unchanged wording, explicit style readback, visible font changes, native history, exact snapshot round-trip and reset.',
    'Source notes are ordinary report paragraphs. Native footnotes/endnotes and complete RTL accessibility from the larger blueprint remain separate acceptance work.',
    'This original fictional report follows the local SDK document-fixture pattern. It is not a translated archival document or an attestation of universal glyph support.',
  ],
] as const
export const METRICS_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="130"><rect width="480" height="130" fill="#eff6ff"/><path d="M20 35H460M20 100H460" stroke="#94a3b8" stroke-dasharray="5 4"/><text x="42" y="100" fill="#1d4ed8" font-family="serif" font-size="76">Ag</text><g font-family="Arial" font-size="15" fill="#334155"><text x="210" y="32">Cap height (reference)</text><text x="210" y="96">Baseline (reference)</text></g></svg>'

export function createData(empty = false): IDocumentData {
  const rows: { text: string; heading?: boolean; page?: boolean; sample?: boolean }[] = empty
    ? [{ text: '' }]
    : [
        { text: 'The Alder Archive / Typography Report', heading: true },
        { text: '31 March 2027 / Editorial systems / Original fictional specimens' },
        { text: '01 / Multilingual comparison' },
        ...SAMPLES.map((sample) => ({ text: `[${sample.id}] ${sample.text}`, sample: true })),
        {
          text: 'Change a sample or the whole report through text-range Facades. Requested font stacks and local face availability are separate observations.',
        },
        ...CHAPTERS.flatMap(([title, ...paragraphs]) => [
          { text: title, heading: true, page: true },
          ...paragraphs.map((text) => ({ text })),
        ]),
      ]
  const paragraphs: IParagraph[] = [],
    textRuns: ITextRun[] = []
  let start = 0
  for (const [index, row] of rows.entries()) {
    const end = start + row.text.length
    const style = {
      ff: FONTS[0].family,
      fs: row.heading ? 21 : row.sample ? 13 : 11,
      bl: row.heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
    }
    paragraphs.push({
      startIndex: end,
      paragraphId: `para_alder_font_${index}`,
      paragraphStyle: {
        namedStyleType: row.heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        textStyle: style,
        pageBreakBefore: row.page ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        spaceBelow: { v: row.heading ? 14 : 12 },
        lineSpacing: 1.2,
      },
    })
    if (end > start) textRuns.push({ st: start, ed: end, ts: style })
    start = end + 1
  }
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  return {
    id: 'alder-font-report',
    title: 'Alder Archive / Typography Report',
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
