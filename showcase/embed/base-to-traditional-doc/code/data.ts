import type { IBaseSnapshot, IDocumentData } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  BooleanNumber,
  createBaseRecordIdField,
  DocumentFlavor,
  LocaleType,
  NamedStyleType,
} from '@univerjs/core'

export const HOST_ID = 'linen-services-schedule'
export const CHILD_ID = 'linen-service-register'
export const SOURCE_NAME = 'Linen Services'
export const BLOCK_MARKER = '03 / Phase allocation and review'
const ref = (field: string) => `[Linen Services]!Services[${field}]`
const included = `COUNTIF(${ref('Status')},"Included")`
const total = `SUMIF(${ref('Status')},"Included",${ref('Fee')})`
const phase = (name: string) => `SUMIFS(${ref('Fee')},${ref('Status')},"Included",${ref('Phase')},"${name}")`
export const INLINE_FORMULAS = [
  { marker: '{{records}}', formula: `=ROWS(${ref('Service')})`, pattern: '0' },
  { marker: '{{included}}', formula: '=' + included, pattern: '0' },
  { marker: '{{fee}}', formula: '=' + total, pattern: '$#,##0.00' },
  { marker: '{{optional}}', formula: `=SUMIF(${ref('Status')},"Optional",${ref('Fee')})`, pattern: '$#,##0.00' },
  { marker: '{{hours}}', formula: `=SUMIF(${ref('Status')},"Included",${ref('Hours')})`, pattern: '0.0' },
  { marker: '{{average}}', formula: '=' + total + '/' + included, pattern: '$#,##0.00' },
  { marker: '{{discovery}}', formula: '=' + phase('Discovery'), pattern: '$#,##0.00' },
  { marker: '{{delivery}}', formula: '=' + phase('Delivery'), pattern: '$#,##0.00' },
  { marker: '{{handoff}}', formula: '=' + phase('Handoff'), pattern: '$#,##0.00' },
  { marker: '{{repeat-total}}', formula: '=' + total, pattern: '$#,##0.00' },
  { marker: '{{share}}', formula: '=' + phase('Delivery') + '/' + total, pattern: '0.0%' },
  {
    marker: '{{signal}}',
    formula: `=IF(COUNTIF(${ref('Status')},"Optional")>0,"Optional work excluded","No optional lines")`,
    pattern: 'General',
  },
] as const

export const SERVICES = [
  [
    'Discovery interviews',
    'Discovery',
    'Included',
    1200,
    12,
    'Mira',
    'Interview six community hosts; synthesize access needs.',
  ],
  [
    'Workshop facilitation',
    'Delivery',
    'Included',
    850,
    8,
    'Jonah',
    'Run two planning sessions with reusable activity sheets.',
  ],
  [
    'Accessible handoff pack',
    'Handoff',
    'Included',
    450,
    4,
    'Esme',
    'Prepare plain-language notes and a tagged reading checklist.',
  ],
  [
    'Follow-up clinic',
    'Delivery',
    'Optional',
    300,
    3,
    'Tariq',
    'An optional office-hours session after the first programme.',
  ],
] as const

const paragraphs = [
  ['LINEN / COMMUNITY PROGRAMME STUDIO', 'kicker'],
  ['A service schedule that stays connected.', 'title'],
  ['Working paper L-29-09 / 04 September 2029 / Illustrative USD amounts', 'meta'],
  ['01 / Scope and fee summary', 'heading'],
  [
    'This fictional studio helps a neighbourhood library plan a community programme. The schedule separates included work from an optional follow-up clinic. It is a demonstration, not a contract, invoice, tax calculation or payment request.',
    'body',
  ],
  [
    'SCOPE / The register contains {{records}} service lines, of which {{included}} are included. Included fees total {{fee}}. Optional work is recorded separately at {{optional}} and is not added to that total.',
    'body',
  ],
  [
    'EFFORT / Included work carries {{hours}} estimated hours. The mean included fee is {{average}} per included line; it is not an hourly rate and does not imply that the lines have equal effort.',
    'body',
  ],
  [
    'Each figure is a native inline formula reading the Relational Table register. The wording, headings and page structure remain authored document content when a fee or status changes.',
    'body',
  ],
  ['Reading order / Summary · Working register · Phase allocation', 'caption'],
  ['02 / Working service register', 'heading'],
  [
    'Double-click the native Relational Table block, then expand it to edit. Correct the facilitation fee from 850 to 1000: the included total becomes 2650. Include the clinic only when you want its fee and hours counted.',
    'body',
  ],
  [
    'Fees and hours are independent recorded estimates. A blank fee is missing information, whereas zero explicitly records no fee. Neither changes the number of included lines unless their status changes.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'ALLOCATION / Included discovery work contributes {{discovery}}, delivery work {{delivery}}, and handoff work {{handoff}}. These phases reconcile to the included total of {{repeat-total}}; optional records are excluded from every phase subtotal.',
    'body',
  ],
  [
    'Delivery represents {{share}} of included fees. The current scope signal is: {{signal}}. Changing the optional clinic to Included affects the delivery allocation as well as the summary on page one.',
    'body',
  ],
  [
    'REVIEW / An owner or scope-note edit adds context without changing the arithmetic. A view filter changes visible records, not the whole-table references. Editing a hidden discovery record must still update this allocation.',
    'body',
  ],
  [
    'BOUNDARIES / If every included fee is zero, a delivery share has no denominator. The native error is shown rather than replaced with 0%. Missing source bindings also remain visible errors until explicitly repaired.',
    'body',
  ],
  [
    'READING COPY / A display-text snapshot detaches the current results for reading. It does not save the separate Relational Table, perform DOCX/PDF conversion or replace the live document.',
    'body',
  ],
  ['Prepared for discussion / No approval workflow, billing integration or backend connection.', 'caption'],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = paragraphs.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Linen / Services schedule',
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
      paragraphs: paragraphs.map(([text, kind], i) => {
        offset += text.length + 1
        const heading = kind === 'heading'
        return {
          startIndex: offset - 1,
          paragraphId: 'linen-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'linen-heading-' + i } : {}),
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
                    ? '#224B4D'
                    : heading
                      ? '#89623E'
                      : kind === 'kicker' || kind === 'caption'
                        ? '#8A586D'
                        : kind === 'meta'
                          ? '#727976'
                          : '#3D504D',
              },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'linen-section' }],
    },
  }
}

export function createChildData(): IBaseSnapshot {
  const time = Date.parse('2029-09-04T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Service', type: BaseFieldType.Text, config: {} },
    {
      id: 'phase',
      name: 'Phase',
      type: BaseFieldType.SingleSelect,
      config: {
        options: ['Discovery', 'Delivery', 'Handoff'].map((name, i) => ({
          id: name,
          name,
          color: ['#82AAA0', '#C7A576', '#BB91A3'][i],
        })),
      },
    },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Included', name: 'Included', color: '#82AAA0' },
          { id: 'Optional', name: 'Optional', color: '#C7A576' },
        ],
      },
    },
    { id: 'fee', name: 'Fee', type: BaseFieldType.Number, config: { precision: 2 } },
    { id: 'hours', name: 'Hours', type: BaseFieldType.Number, config: { precision: 1 } },
    { id: 'lead', name: 'Lead', type: BaseFieldType.Text, config: {} },
    { id: 'scope', name: 'Scope note', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    SERVICES.map(([title, phaseName, status, fee, hours, lead, scope], i) => {
      const id = 'service-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, phase: phaseName, status, fee, hours, lead, scope },
        },
      ]
    }),
  )
  return {
    id: CHILD_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['services'],
    tables: {
      services: {
        id: 'services',
        name: 'Services',
        formulaName: 'Services',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['services-grid'],
        views: {
          'services-grid': {
            id: 'services-grid',
            tableId: 'services',
            name: 'Working schedule',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 245 : id === 'scope' ? 390 : id === 'fee' || id === 'hours' ? 105 : 120,
                },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
          },
        },
      },
    },
  }
}
