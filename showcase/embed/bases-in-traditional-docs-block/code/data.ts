import type { BaseCellValue, IBaseSnapshot, IDocumentData, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { normalizeBaseDateSerial, serializeRecordLinkIds } from '@univerjs-pro/bases'
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

export const HOST_ID = 'rowan-readiness-review'
export const CHILD_ID = 'rowan-station-evidence'
export const BLOCK_MARKER = '03 / Conditions and disposition'
const REVIEW_TIME = Date.parse('2028-06-13T09:00:00Z')
export const BRIEF = [
  ['ROWAN / Field-station readiness review', 'kicker'],
  ['Evidence before deployment.', 'title'],
  ['Technical review R-28-06 / 13 June 2028 / Working draft', 'meta'],
  ['01 / Purpose, sample and limits', 'heading'],
  [
    'This fictional review considers a small weather-observation field station for a two-week supervised trial. The planned setup has three portable sensor nodes and a daily manual reference reading. No equipment has been deployed and no measurements in this demo come from a real site.',
    'body',
  ],
  [
    'The review separates instrument evidence from deployment decisions. Calibration notes, timing records and recovery procedures are useful only when their scope and limitations are visible. A complete row is not a certification, and a named owner is not an assignment sent to a real person.',
    'body',
  ],
  [
    'Seven review items and four linked owners form the register. The report retains its written conditions while reviewers edit supporting records; the SDK does not silently turn those edits into approval.',
    'body',
  ],
  ['02 / Evidence register and owners', 'heading'],
  [
    'Open the Base block to inspect a review item, then expand it to read the evidence notes and Owners directory. Linked owner labels follow a renamed person without changing the record identifier. Dates describe fictional review slots, not a calendar integration.',
    'body',
  ],
  ['', 'body'],
  ['03 / Conditions and disposition', 'heading'],
  [
    'CONDITION A / Traceability. Imani checks that every calibration note identifies its source and the relevant node. The two-point comparison is a demonstration assumption; it is not a metrology procedure or proof of accuracy.',
    'body',
  ],
  [
    'CONDITION B / Recovery. Jules and Luca rehearse a missed upload and a local storage handover before any supervised trial. A status label does not establish that the rehearsal has happened.',
    'body',
  ],
  [
    'CONDITION C / Exposure. Nora records the enclosure questions that remain open. This example does not assess electrical safety, environmental protection ratings or site permissions. Those decisions require appropriate separate review.',
    'body',
  ],
  ['Disposition: hold for evidence review.', 'warning'],
  ['Appendix / Independent records', 'heading'],
  [
    'The Base contains review work, not approvals. Editing the report moves its native body anchor without rewriting the evidence register. Editing a linked owner updates Base labels but does not rewrite names in the report. Reload discards local edits; no notifications, certifications, external files or backend requests are produced.',
    'body',
  ],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = BRIEF.map(([text, kind], index) => {
    offset += text.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `rowan-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(text.startsWith('02 /') || text.startsWith('03 /') ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        ...(heading ? { headingId: `rowan-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: heading || kind === 'kicker' || kind === 'meta' ? 'Arial' : 'Georgia',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 10 : 12,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#9B6D35'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#653F50'
                  : kind === 'meta'
                    ? '#77727A'
                    : '#384B5C',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Rowan / Field-station readiness review',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 72,
      marginBottom: 72,
      marginLeft: 72,
      marginRight: 72,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'rowan-brief-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
function table(
  id: string,
  name: string,
  definitions: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fields = [createBaseRecordIdField(), ...definitions]
  const fieldOrder = fields.map((definition) => definition.id)
  const records = Object.fromEntries(
    rows.map((values, index) => {
      const recordId = `${id}-${index + 1}`
      return [
        recordId,
        {
          id: recordId,
          orderKey: String(index).padStart(3, '0'),
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
        },
      ]
    }),
  )
  return {
    id,
    name,
    formulaName: id,
    primaryFieldId: 'title',
    fields: Object.fromEntries(fields.map((definition) => [definition.id, structuredClone(definition)])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'evidence' ? 'Review evidence' : 'Owner directory',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width:
                fieldId === 'title'
                  ? 245
                  : fieldId === 'evidence'
                    ? 380
                    : fieldId === 'role'
                      ? 210
                      : fieldId === 'coverage'
                        ? 190
                        : fieldId === 'backup'
                          ? 440
                          : 140,
            },
          ]),
        ),
        filter: null,
        sort: [],
        group: [],
        config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
      },
    },
  }
}

export function createChildData(): IBaseSnapshot {
  const people = table(
    'people',
    'Owners',
    [
      field('title', 'Name', BaseFieldType.Text),
      field('role', 'Review responsibility', BaseFieldType.Text),
      field('coverage', 'Review slot', BaseFieldType.Text),
      field('backup', 'Handover note', BaseFieldType.Text),
    ],
    [
      {
        title: 'Imani Cole',
        role: 'Instrument traceability',
        coverage: 'Tue / 09:00–11:00',
        backup: 'Compare node A and reference log',
      },
      {
        title: 'Jules Tan',
        role: 'Timing and transfer',
        coverage: 'Wed / 13:00–15:00',
        backup: 'Replay a missed upload',
      },
      {
        title: 'Nora Singh',
        role: 'Enclosure observations',
        coverage: 'Thu / 10:00–12:00',
        backup: 'List unresolved exposure questions',
      },
      {
        title: 'Luca Reed',
        role: 'Field handover',
        coverage: 'Fri / 09:00–12:00',
        backup: 'Walk through storage recovery',
      },
    ],
  )
  const items = [
    ['Calibration trace', 1, 'review', 0, 'Two comparison points logged; node C reference note is missing.'],
    ['Clock drift log', 2, 'ready', -1, 'Timestamp differences recorded during a simulated disconnect.'],
    ['Battery endurance', 4, 'review', 2, 'Bench run ended at 18 hours; supervised trial duration is unresolved.'],
    ['Enclosure seal', 3, 'blocked', 1, 'Cable entry observation needs a separate qualified review.'],
    ['Recovery card', 4, 'ready', -2, 'Offline handover steps read through; no field exercise performed.'],
    ['Storage rotation', 2, 'planned', 3, 'Prepare a second local archive and compare the manifest.'],
    ['Weather exposure', 1, 'planned', 5, 'Describe environmental assumptions and missing evidence before deployment.'],
  ] as const
  const evidence = table(
    'evidence',
    'Evidence',
    [
      field('title', 'Review item', BaseFieldType.Text),
      field('owner', 'Owner', BaseFieldType.RecordLink, {
        targetTableId: 'people',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'Status', BaseFieldType.SingleSelect, {
        options: [
          { id: 'ready', name: 'Recorded', color: '#4F7F79' },
          { id: 'review', name: 'In review', color: '#AD8144' },
          { id: 'blocked', name: 'Open issue', color: '#9C586D' },
          { id: 'planned', name: 'Planned', color: '#617E9C' },
        ],
      }),
      field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('evidence', 'Evidence / limitation', BaseFieldType.Text),
    ],
    items.map(([title, owner, state, day, note]) => ({
      title,
      owner: serializeRecordLinkIds([`people-${owner}`]),
      state,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
      evidence: note,
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Rowan / Field-station evidence',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['evidence', 'people'],
    tables: { evidence, people },
  }
}
