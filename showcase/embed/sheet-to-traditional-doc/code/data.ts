import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'aster-research-report'
export const SHEET_UNIT_ID = 'aster-observation-source'
export const SHEET_ID = 'observations'
export const SHEET_NAME = 'Aster Observations'
export const BLOCK_MARKERS = ['03 / Interpretation and boundaries'] as const
const sample = "'[Aster Observations]Trials'!B5:B9"
const target = "'[Aster Observations]Trials'!E5"
export const INLINE_FORMULAS = [
  { marker: '{{count}}', formula: `=COUNT(${sample})`, pattern: '0' },
  { marker: '{{total}}', formula: `=SUM(${sample})`, pattern: '0.00' },
  { marker: '{{mean}}', formula: `=AVERAGE(${sample})`, pattern: '0.00' },
  { marker: '{{median}}', formula: `=MEDIAN(${sample})`, pattern: '0.00' },
  { marker: '{{minimum}}', formula: `=MIN(${sample})`, pattern: '0.00' },
  { marker: '{{maximum}}', formula: `=MAX(${sample})`, pattern: '0.00' },
  { marker: '{{target}}', formula: `=${target}`, pattern: '0.00' },
  { marker: '{{share}}', formula: `=COUNTIF(${sample},">="&${target})/COUNT(${sample})`, pattern: '0%' },
  { marker: '{{repeat-mean}}', formula: `=AVERAGE(${sample})`, pattern: '0.00' },
  { marker: '{{difference}}', formula: `=AVERAGE(${sample})-${target}`, pattern: '+0.00;-0.00;0.00' },
] as const

const sections = [
  ['ASTER / MATERIAL EXPLORATIONS', 'kicker'],
  ['When the sample changes, the report should follow.', 'title'],
  ['Technical note A-29-04 / 18 April 2029 / Original simulated observations', 'meta'],
  ['01 / A small rebound study', 'heading'],
  [
    'This fictional folded-paper study asks how five simulated rebound distances can be summarized without disconnecting the report from its observations. It demonstrates a live document, not an actual experiment or a material-performance claim.',
    'body',
  ],
  [
    'ABSTRACT / The numeric sample contains {{count}} observations with a combined distance of {{total}} mm. Its mean is {{mean}} mm and its median is {{median}} mm. The observed range extends from {{minimum}} mm to {{maximum}} mm.',
    'body',
  ],
  [
    'Against an illustrative target of {{target}} mm, {{share}} of the numeric observations meet or exceed the target. The target is an editable assumption, not a certified acceptance limit.',
    'body',
  ],
  [
    'The values inside these paragraphs are native Formula Custom Ranges. Editing the source does not replace the surrounding words or regenerate this report from an HTML template.',
    'body',
  ],
  ['Reading order / Summary -> observation sheet -> interpretation', 'caption'],
  ['02 / Observation sheet and method', 'heading'],
  [
    'The five amber cells in B5:B9 are rebound distances in millimetres. E5 holds the comparison target. Expand the native Sheet block to edit a trial; the formulas in both report chapters read this same source workbook.',
    'body',
  ],
  [
    'A blank or text label is not a measured zero. COUNT and AVERAGE ignore those non-numeric entries; an explicit zero remains a numeric observation. No result is imputed for missing data.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'The current mean is {{repeat-mean}} mm. Relative to the editable target, the mean-minus-target difference is {{difference}} mm. These are separate native formula ranges on this page, linked to the same observations as the abstract.',
    'body',
  ],
  [
    'A positive difference says only that this small simulated average exceeds the chosen target. It does not establish reliability, statistical significance or performance under a different test method. There are no real participants, laboratory measurements or published findings behind these numbers.',
    'body',
  ],
  [
    'DATA HANDLING / Clearing every observation leaves no numeric sample. The native average and ratio errors are shown as errors rather than being replaced with a reassuring zero. Restore the five inputs to recover the report.',
    'body',
  ],
  [
    'REPRODUCIBILITY / The live document snapshot contains formula bindings; a display-text snapshot is a detached reading copy. Neither operation is a DOCX/PDF conversion or evidence that the separate source workbook has been persisted.',
    'body',
  ],
  ['Decision / Review the assumptions before interpreting the result.', 'caption'],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = sections.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Aster / Research results',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 68,
      marginBottom: 68,
      marginLeft: 72,
      marginRight: 72,
    },
    drawings: {},
    drawingsOrder: [],
    body: {
      dataStream,
      paragraphs: sections.map(([text, kind], i) => {
        offset += text.length + 1
        const heading = kind === 'heading'
        return {
          startIndex: offset - 1,
          paragraphId: 'aster-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'aster-heading-' + i } : {}),
            ...(text.startsWith('02 /') || text.startsWith('03 /') ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
            spaceAbove: { v: heading ? 16 : 0 },
            spaceBelow: { v: kind === 'title' ? 16 : 12 },
            lineSpacing: 1.2,
            textStyle: {
              ff: kind === 'body' || kind === 'title' ? 'Georgia' : 'Arial',
              fs: kind === 'title' ? 29 : heading ? 16 : kind === 'body' ? 12 : 10,
              bl: heading || kind === 'title' || kind === 'kicker' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
              cl: {
                rgb:
                  kind === 'title'
                    ? '#233550'
                    : heading
                      ? '#665481'
                      : kind === 'kicker' || kind === 'caption'
                        ? '#946D30'
                        : kind === 'meta'
                          ? '#6A7888'
                          : '#3D4C60',
              },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'aster-section' }],
    },
  }
}

export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ASTER / Rebound observations', s: 'title' } },
    1: { 0: { v: 'Five simulated trials / millimetres / no real experiment', s: 'muted' } },
    3: {
      0: { v: 'Trial', s: 'header' },
      1: { v: 'Distance / mm', s: 'header' },
      2: { v: 'Observation note', s: 'header' },
      4: { v: 'Target / mm', s: 'header' },
    },
    10: { 0: { v: 'Numeric count', s: 'header' }, 1: { f: '=COUNT(B5:B9)', s: 'count' } },
    11: { 0: { v: 'Mean / mm', s: 'header' }, 1: { f: '=AVERAGE(B5:B9)', s: 'total' } },
    13: { 0: { v: 'Blank is missing; zero is measured. The report reads B5:B9 and E5.', s: 'muted' } },
  }
  const notes = [
    'Short fold / sample A',
    'Parallel fold / sample B',
    'Centre fold / sample C',
    'Wide fold / sample D',
    'Reverse fold / sample E',
  ]
  ;[7.5, 8, 8.5, 9, 9.5].forEach((value, i) => {
    cellData[i + 4] = {
      0: { v: 'Trial ' + (i + 1), s: i % 2 ? 'stripe' : 'body' },
      1: { v: value, s: 'input' },
      2: { v: notes[i], s: 'muted' },
    }
  })
  cellData[4][4] = { v: 8.5, s: 'target' }
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#233550' } },
      header: { bg: { rgb: '#E8E1F1' }, bl: 1, cl: { rgb: '#665481' } },
      body: { cl: { rgb: '#3D4C60' } },
      stripe: { bg: { rgb: '#F1F4F8' } },
      muted: { fs: 10, cl: { rgb: '#6A7888' } },
      input: { bg: { rgb: '#F7EACC' }, n: { pattern: '0.00' }, cl: { rgb: '#795B27' } },
      target: { bg: { rgb: '#DCEDE9' }, n: { pattern: '0.00' }, cl: { rgb: '#2F6A61' } },
      total: { bg: { rgb: '#E8E1F1' }, bl: 1, n: { pattern: '0.00' }, cl: { rgb: '#665481' } },
      count: { bg: { rgb: '#E8E1F1' }, bl: 1, n: { pattern: '0' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Trials',
        rowCount: 18,
        columnCount: 6,
        defaultRowHeight: 28,
        defaultColumnWidth: 85,
        columnData: { 0: { w: 110 }, 1: { w: 105 }, 2: { w: 205 }, 3: { w: 20 }, 4: { w: 115 } },
        rowData: { 0: { h: 40 } },
        cellData,
        mergeData: [0, 1, 13].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}
