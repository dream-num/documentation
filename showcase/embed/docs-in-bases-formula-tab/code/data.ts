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

export const HOST_ID = 'ember-release-register'
export const CHILD_ID = 'ember-release-notes'
export const SOURCE_NAME = 'Ember Release'
const column = (name: string) => '[Ember Release]!Changes[' + name + ']'
const count = 'COUNTA(' + column('Change') + ')'
const complete = 'COUNTIF(' + column('Stage') + ',"Complete")'
const review = 'COUNTIF(' + column('Stage') + ',"Review")'
const blocked = 'COUNTIF(' + column('Stage') + ',"Blocked")'
const remaining = 'SUMIF(' + column('Stage') + ',"<>Complete",' + column('Hours') + ')'
const blockedHours = 'SUMIF(' + column('Stage') + ',"Blocked",' + column('Hours') + ')'
export const INLINE_FORMULAS = [
  { marker: '{{total}}', formula: '=' + count, pattern: '0' },
  { marker: '{{complete}}', formula: '=' + complete, pattern: '0' },
  { marker: '{{review}}', formula: '=' + review, pattern: '0' },
  { marker: '{{blocked}}', formula: '=' + blocked, pattern: '0' },
  { marker: '{{share}}', formula: '=' + complete + '/' + count, pattern: '0.0%' },
  { marker: '{{remaining}}', formula: '=' + remaining, pattern: '0.0" h"' },
  { marker: '{{blockedHours}}', formula: '=' + blockedHours, pattern: '0.0" h"' },
  { marker: '{{average}}', formula: '=' + remaining + '/(' + count + '-' + complete + ')', pattern: '0.0" h"' },
  {
    marker: '{{features}}',
    formula: '=COUNTIFS(' + column('Kind') + ',"Feature",' + column('Stage') + ',"Complete")',
    pattern: '0',
  },
  {
    marker: '{{fixes}}',
    formula: '=COUNTIFS(' + column('Kind') + ',"Fix",' + column('Stage') + ',"Complete")',
    pattern: '0',
  },
  {
    marker: '{{guides}}',
    formula: '=COUNTIFS(' + column('Kind') + ',"Guide",' + column('Stage') + ',"Complete")',
    pattern: '0',
  },
  {
    marker: '{{signal}}',
    formula:
      '=IF(' +
      blocked +
      '>0,"Resolve the release blocker",IF(' +
      review +
      '>0,"Finish the review queue","Ready for editorial sign-off"))',
    pattern: 'General',
  },
] as const

// Original fictional release; estimates describe remaining work, not elapsed effort.
export const CHANGES = [
  ['Saved reading lists', 'Feature', 'Complete', 0, 'Noor', 'Keep a personal set of reading material.'],
  ['Quiet-hours preference', 'Feature', 'Complete', 0, 'Eli', 'Choose when non-urgent reminders appear.'],
  ['Compact search results', 'Feature', 'Complete', 0, 'Mina', 'Compare more results without losing context.'],
  ['Workspace color labels', 'Feature', 'Complete', 0, 'Owen', 'Distinguish spaces by name as well as color.'],
  ['Keyboard focus after search', 'Fix', 'Complete', 0, 'Noor', 'Keep focus visible when results arrive.'],
  ['Duplicate bookmark repair', 'Fix', 'Complete', 0, 'Eli', 'Retain the original bookmark after a retry.'],
  ['Long title wrapping', 'Fix', 'Complete', 0, 'Mina', 'Prevent clipped titles in narrow panels.'],
  ['First collection walkthrough', 'Guide', 'Complete', 0, 'Owen', 'Explain the first five minutes.'],
  ['Shortcut reference', 'Guide', 'Complete', 0, 'Noor', 'Document tested desktop shortcuts.'],
  ['Screen-reader result order', 'Fix', 'Review', 3, 'Mina', 'Verify announcements with the review checklist.'],
  ['Bulk bookmark migration', 'Feature', 'Blocked', 8, 'Eli', 'Agree duplicate handling before the migration review.'],
  ['Offline limitations note', 'Guide', 'Review', 1.5, 'Owen', 'State which actions still require a connection.'],
] as const

export function createHostData(): IBaseSnapshot {
  const time = Date.parse('2029-09-27T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Change', type: BaseFieldType.Text, config: {} },
    {
      id: 'kind',
      name: 'Kind',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Feature', name: 'Feature', color: '#3E7185' },
          { id: 'Fix', name: 'Fix', color: '#B66244' },
          { id: 'Guide', name: 'Guide', color: '#8A759D' },
        ],
      },
    },
    {
      id: 'stage',
      name: 'Stage',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Complete', name: 'Complete', color: '#558375' },
          { id: 'Review', name: 'Review', color: '#C29A52' },
          { id: 'Blocked', name: 'Blocked', color: '#B66244' },
        ],
      },
    },
    { id: 'hours', name: 'Hours', type: BaseFieldType.Number, config: { decimalPlaces: 1 } },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Reader benefit / Next check', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    CHANGES.map(([title, kind, stage, hours, owner, note], i) => {
      const id = 'change-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, kind, stage, hours, owner, note },
        },
      ]
    }),
  )
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['changes'],
    tables: {
      changes: {
        id: 'changes',
        name: 'Changes',
        formulaName: 'Changes',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['changes-grid'],
        views: {
          'changes-grid': {
            id: 'changes-grid',
            tableId: 'changes',
            name: 'Release register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 270 : id === 'note' ? 440 : id === 'owner' ? 110 : 125,
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
export const MEMO = [
  ['EMBER / RELEASE 0.8 FIELD NOTES', 'kicker'],
  ['Ready to explain. Not yet to ship.', 'title'],
  ['Editorial draft / 27 September 2029 / Original fictional reading workspace', 'meta'],
  ['01 / The release at a glance', 'heading'],
  [
    'The register tracks {{total}} changes: {{complete}} complete, {{review}} in review and {{blocked}} blocked. Completion by record is {{share}}. Each row has equal weight in that percentage; a large migration is still one row.',
    'body',
  ],
  ['02 / What is left to resolve', 'heading'],
  [
    'Unfinished changes carry {{remaining}} of estimated remaining work, including {{blockedHours}} on blocked changes. The average is {{average}} per unfinished record. These estimates are not elapsed effort, a delivery date or an automatic launch decision.',
    'body',
  ],
  ['Review prompt: {{signal}}.', 'warning'],
  ['03 / The reader-facing story', 'heading'],
  [
    'Completed changes include {{features}} features, {{fixes}} fixes and {{guides}} guides. Saved reading lists and quiet-hours preferences support a calmer reading routine. Focus handling and long-title wrapping make the workspace easier to navigate.',
    'body',
  ],
  [
    'The migration still needs an explicit duplicate-handling decision. A green completion percentage must not replace that discussion. Keep reader benefits and unresolved limits in the same release note.',
    'body',
  ],
  ['04 / Write with the live register', 'heading'],
  [
    'Open Changes in the native Relational Table list to edit the source, then return to Release notes. Filtering the view does not filter these whole-table formulas. Changing an owner does not change completion; changing a hidden record can change a dependent count.',
    'body',
  ],
  [
    'This is an editable draft, not generated prose. Only inline formula ranges update. No publishing, backend, migration job, collaboration service or automated release is connected.',
    'meta',
  ],
] as const
export function createChildData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], index) => {
    offset += text.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `ember-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `ember-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: kind === 'title' ? 'Arial' : 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#B66244'
                : kind === 'meta'
                  ? '#72766E'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#254D61'
                    : '#485C62',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Ember / Release notes',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1040, height: 1100 },
      marginTop: 28,
      marginBottom: 28,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'ember-memo-section' }],
    },
  }
}
