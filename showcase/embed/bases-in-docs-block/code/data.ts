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

export const HOST_ID = 'orchard-launch-brief'
export const CHILD_ID = 'orchard-launch-responsibilities'
export const BLOCK_MARKER = '03 / Make the release decision'
const REVIEW_TIME = Date.parse('2027-06-08T09:00:00Z')
export const BRIEF = [
  ['ORCHARD / Library collection service', 'kicker'],
  ['A launch is a handoff, not a date.', 'title'],
  ['Release brief · 8 June 2027 · Coordinator: Maya Patel · Decision pending', 'meta'],
  ['01 / A small, observable release', 'heading'],
  [
    'Open appointment-based collection at two neighborhood libraries. The first cohort is limited to 40 invited readers. A staffed phone fallback stays available; no public launch is scheduled yet.',
    'body',
  ],
  ['02 / Owners, evidence and open questions', 'heading'],
  [
    'The live readiness register below separates completed checks from unresolved dependencies. Open a record to review evidence, or expand the Relational Table to see the People directory. Names are linked records, not copied text.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'GO / Maya records a decision only after keyboard access, cancellation and desk handover have evidence. A green status by itself is not a release approval.',
    'body',
  ],
  [
    'HOLD / Keep invitations paused while the contact-card review is blocked. Theo owns the revised wording; Lina reviews the fallback route with front-desk staff.',
    'body',
  ],
  [
    'WATCH / During the first week, record missed collections and calls needing manual recovery. Review actual reader outcomes before widening the cohort.',
    'body',
  ],
  ['Decision: not released.', 'warning'],
  [
    'Changing a Relational Table record does not rewrite this decision. The narrative and the register remain independent SDK documents. All names, dates and records are fictional; no invitations, notifications or approvals are sent. Reload loses local edits.',
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
      paragraphId: `orchard-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `orchard-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 32 : heading ? 18 : kind === 'meta' || kind === 'kicker' ? 11 : 14,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#A16E2F'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#654D78'
                  : kind === 'meta'
                    ? '#807587'
                    : '#494453',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Orchard / Launch responsibilities',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 960, height: 1000 },
      marginTop: 32,
      marginBottom: 32,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'orchard-brief-section' }],
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
        name: id === 'readiness' ? 'Launch readiness' : 'People directory',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 245 : fieldId === 'evidence' ? 300 : fieldId === 'role' ? 210 : 140,
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
    'People',
    [
      field('title', 'Name', BaseFieldType.Text),
      field('role', 'Responsibility', BaseFieldType.Text),
      field('coverage', 'Coverage window', BaseFieldType.Text),
      field('backup', 'Fallback contact', BaseFieldType.Text),
    ],
    [
      { title: 'Maya Patel', role: 'Release coordinator', coverage: 'Mon–Thu / 09:00–15:00', backup: 'Lina Brooks' },
      { title: 'Theo Park', role: 'Service content', coverage: 'Tue–Fri / 10:00–16:00', backup: 'Maya Patel' },
      { title: 'Lina Brooks', role: 'Front-desk operations', coverage: 'Mon–Fri / 08:00–14:00', backup: 'Omar Reed' },
      { title: 'Omar Reed', role: 'Accessibility review', coverage: 'Mon, Wed, Fri / 12:00–17:00', backup: 'Eva Chen' },
      { title: 'Eva Chen', role: 'Reliability rehearsal', coverage: 'Tue–Sat / 09:00–13:00', backup: 'Omar Reed' },
    ],
  )
  const tasks = [
    ['Keyboard walkthrough', 4, 'review', 0, 'Focus order recorded; final collection step still under review.'],
    ['Cancellation rehearsal', 5, 'ready', -1, 'Three rehearsal paths return the slot to the queue.'],
    ['Contact-card wording', 2, 'blocked', 1, 'Await the fallback phone number and desk-hours check.'],
    ['Desk handover pack', 3, 'review', 2, 'Two branch leads need to sign off the recovery notes.'],
    ['Invitation cohort', 1, 'planned', 3, 'Draft list capped at 40; nothing has been sent.'],
    ['No-show recovery', 3, 'ready', -2, 'Manual call script reviewed with both front desks.'],
    ['Failure drill', 5, 'planned', 4, 'Simulate an unavailable booking link with staff present.'],
    ['Week-one review', 1, 'planned', 10, 'Compare completed collections with manual recovery effort.'],
  ] as const
  const readiness = table(
    'readiness',
    'Readiness',
    [
      field('title', 'Release check', BaseFieldType.Text),
      field('owner', 'Owner', BaseFieldType.RecordLink, {
        targetTableId: 'people',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'State', BaseFieldType.SingleSelect, {
        options: [
          { id: 'ready', name: 'Ready', color: '#568676' },
          { id: 'review', name: 'In review', color: '#B88335' },
          { id: 'blocked', name: 'Blocked', color: '#A45D74' },
          { id: 'planned', name: 'Planned', color: '#607EA3' },
        ],
      }),
      field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('evidence', 'Evidence / next question', BaseFieldType.Text),
    ],
    tasks.map(([title, owner, state, day, evidence]) => ({
      title,
      owner: serializeRecordLinkIds([`people-${owner}`]),
      state,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
      evidence,
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Orchard / Launch responsibilities',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['readiness', 'people'],
    tables: { readiness, people },
  }
}
