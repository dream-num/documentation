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
export const HOST_ID = 'fern-editorial-desk'
export const CHILD_ID = 'fern-editorial-playbook'
const REVIEW_TIME = Date.parse('2027-10-26T09:00:00Z')

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
  const fieldOrder = fields.map((item) => item.id)
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
    fields: Object.fromEntries(fields.map((item) => [item.id, item])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'assignments' ? 'Editorial queue' : 'Issue calendar',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 230 : fieldId === 'next' ? 240 : fieldId === 'edition' ? 180 : 135,
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

export function createHostData(): IBaseSnapshot {
  const editions = table(
    'editions',
    'Editions',
    [
      field('title', 'Issue', BaseFieldType.Text),
      field('release', 'Draft release', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('next', 'Editorial question', BaseFieldType.Text),
    ],
    [
      {
        title: 'Everyday Water',
        release: normalizeBaseDateSerial(REVIEW_TIME + 3 * 86400000),
        next: 'How do small water habits shape a street?',
      },
      {
        title: 'After Hours',
        release: normalizeBaseDateSerial(REVIEW_TIME + 10 * 86400000),
        next: 'Who keeps the neighborhood moving at night?',
      },
      {
        title: 'Repair Culture',
        release: normalizeBaseDateSerial(REVIEW_TIME + 17 * 86400000),
        next: 'What makes a repair worth attempting?',
      },
    ],
  )
  const assignments = table(
    'assignments',
    'Assignments',
    [
      field('title', 'Working title', BaseFieldType.Text),
      field('edition', 'Issue', BaseFieldType.RecordLink, {
        targetTableId: 'editions',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('format', 'Format', BaseFieldType.SingleSelect, {
        options: [
          { id: 'feature', name: 'Feature', color: '#325C4A' },
          { id: 'guide', name: 'Guide', color: '#9A5135' },
          { id: 'interview', name: 'Interview', color: '#647B92' },
          { id: 'photo', name: 'Photo essay', color: '#927A9D' },
        ],
      }),
      field('state', 'Stage', BaseFieldType.SingleSelect, {
        options: [
          { id: 'pitch', name: 'Pitch', color: '#A38A63' },
          { id: 'reporting', name: 'Reporting', color: '#647B92' },
          { id: 'editing', name: 'Editing', color: '#9A5135' },
          { id: 'review', name: 'Review', color: '#325C4A' },
        ],
      }),
      field('owner', 'Writer', BaseFieldType.Text),
      field('words', 'Target words', BaseFieldType.Number, {
        decimalPlaces: 0,
        useThousands: true,
        separatorStyle: 'commaPeriod',
      }),
      field('next', 'Next editorial check', BaseFieldType.Text),
    ],
    [
      {
        title: 'Water before work',
        edition: serializeRecordLinkIds(['editions-1']),
        format: 'feature',
        state: 'editing',
        owner: 'Leah',
        words: 900,
        next: 'Confirm pump opening times',
      },
      {
        title: 'A refill route',
        edition: serializeRecordLinkIds(['editions-1']),
        format: 'guide',
        state: 'reporting',
        owner: 'Samir',
        words: 450,
        next: 'Walk the route twice',
      },
      {
        title: 'The rain collectors',
        edition: serializeRecordLinkIds(['editions-1']),
        format: 'interview',
        state: 'pitch',
        owner: 'Nina',
        words: 700,
        next: 'Agree the interview scope',
      },
      {
        title: 'Last bus home',
        edition: serializeRecordLinkIds(['editions-2']),
        format: 'feature',
        state: 'reporting',
        owner: 'Jonah',
        words: 1100,
        next: 'Check the weekend timetable',
      },
      {
        title: 'Windows after dark',
        edition: serializeRecordLinkIds(['editions-2']),
        format: 'photo',
        state: 'review',
        owner: 'Nina',
        words: 220,
        next: 'Review captions and permissions',
      },
      {
        title: 'The bakery shift',
        edition: serializeRecordLinkIds(['editions-2']),
        format: 'interview',
        state: 'editing',
        owner: 'Leah',
        words: 750,
        next: 'Separate quote from paraphrase',
      },
      {
        title: 'One jacket, three lives',
        edition: serializeRecordLinkIds(['editions-3']),
        format: 'feature',
        state: 'pitch',
        owner: 'Samir',
        words: 950,
        next: 'Find the second perspective',
      },
      {
        title: 'Before you open it',
        edition: serializeRecordLinkIds(['editions-3']),
        format: 'guide',
        state: 'reporting',
        owner: 'Jonah',
        words: 500,
        next: 'Clarify scope; no safety advice',
      },
    ],
  )
  return {
    id: HOST_ID,
    name: 'Fern / The neighborhood journal',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['assignments', 'editions'],
    tables: { assignments, editions },
  }
}
export const MEMO = [
  ['FERN / EDITORIAL PLAYBOOK', 'kicker'],
  ['Useful stories, carefully told.', 'title'],
  ['Working edition 03 · 26 October 2027 · Editor: Leah Chen', 'meta'],
  ['01 / Start with the reader', 'heading'],
  [
    'Fern is a fictional neighborhood journal. Our next three issues explore everyday water, life after hours and repair culture. Write for a curious resident with five minutes to spare, not for an industry insider. Explain unfamiliar terms before using them again.',
    'body',
  ],
  ['02 / Make one clear promise', 'heading'],
  [
    'Each pitch should answer one question and name a useful takeaway. A feature follows a person or place; a guide explains a bounded process; an interview preserves a distinct voice. Word targets in Assignments are planning constraints, not quotas to fill.',
    'body',
  ],
  ['03 / Keep evidence with the draft', 'heading'],
  [
    "Record where a claim came from and when it was checked. Separate direct quotations, paraphrases and the writer's observations. Timetables, opening hours and prices need a dated source. When two sources disagree, explain the uncertainty rather than selecting the tidier number.",
    'body',
  ],
  ['04 / Voice and access', 'heading'],
  [
    'Use concrete nouns and short paragraphs. Describe what a photograph adds before writing its caption. Avoid assuming that every reader can travel, pay, see or hear in the same way. Use names and pronouns agreed for the story; do not invent a quotation to smooth the prose.',
    'body',
  ],
  ['05 / Review is not publication', 'warning'],
  [
    'The Review stage means an editor should check the draft; it does not indicate consent, legal approval or scheduled publication. The fictional photo essay still needs its permissions check. This demo stores no source contact details and sends nothing to contributors.',
    'body',
  ],
  ['06 / Handoff with the open questions', 'heading'],
  [
    'Before a handoff, leave the latest draft, a short source note and the unresolved questions together. The next editor should know which claim needs a second check. If a correction is needed after publication, describe what changed and why; this demo does not implement a publishing or correction service.',
    'body',
  ],
  [
    'Data boundary: original fictional stories. The playbook and Base records are independent; changing prose does not update stage, word target, issue or release date. Reload loses local edits.',
    'meta',
  ],
] as const

export function createChildData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([content, kind], index) => {
    offset += content.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `fern-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `fern-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#9A5135'
                : kind === 'meta'
                  ? '#7B746C'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#325C4A'
                    : '#393E39',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Fern / Editorial playbook',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 860, height: 1000 },
      marginTop: 24,
      marginBottom: 28,
      marginLeft: 52,
      marginRight: 52,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'fern-memo-section' }],
    },
  }
}
