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

export const HOST_ID = 'cinder-incident-brief'
export const CHILD_ID = 'cinder-incident-register'
export const SOURCE_NAME = 'Cinder Incidents'
export const BLOCK_MARKER = '03 / Handoff notes'
const statuses = '[Cinder Incidents]!Incidents[Status]'
const impact = '[Cinder Incidents]!Incidents[Sessions]'
const count = 'COUNTA([Cinder Incidents]!Incidents[Incident])'
const open = 'COUNTIF(' + statuses + ',"Open")'
const resolved = 'COUNTIF(' + statuses + ',"Resolved")'
const openImpact = 'SUMIF(' + statuses + ',"Open",' + impact + ')'
export const INLINE_FORMULAS = [
  { marker: '{{total}}', formula: '=' + count, pattern: '0' },
  { marker: '{{open}}', formula: '=' + open, pattern: '0' },
  { marker: '{{monitoring}}', formula: '=COUNTIF(' + statuses + ',"Monitoring")', pattern: '0' },
  { marker: '{{resolved}}', formula: '=' + resolved, pattern: '0' },
  { marker: '{{openImpact}}', formula: '=' + openImpact, pattern: '#,##0' },
  { marker: '{{monitoringImpact}}', formula: '=SUMIF(' + statuses + ',"Monitoring",' + impact + ')', pattern: '#,##0' },
  { marker: '{{allImpact}}', formula: '=SUM(' + impact + ')', pattern: '#,##0' },
  { marker: '{{resolution}}', formula: '=' + resolved + '/' + count, pattern: '0.0%' },
  { marker: '{{average}}', formula: '=' + openImpact + '/' + open, pattern: '0.0' },
  {
    marker: '{{signal}}',
    formula: '=IF(' + open + '=0,"No open investigations","Investigation continues")',
    pattern: 'General',
  },
] as const

export const INCIDENTS = [
  ['Login redirect loop', 'Open', 120, 'Mara', 'Compare the callback trace with the last deployment.'],
  ['Delayed receipt emails', 'Open', 45, 'Ivo', 'Inspect the queue before changing retry policy.'],
  ['Search indexing lag', 'Open', 15, 'Bea', 'Replay a small batch and verify freshness.'],
  ['Checkout retry spike', 'Monitoring', 30, 'Jin', 'Watch the reduced retry rate through the next peak.'],
  ['Stale event cache', 'Monitoring', 10, 'Tess', 'Confirm fresh entries across two cache cycles.'],
  ['Image fallback mismatch', 'Resolved', 60, 'Omar', 'Fallback rendering verified on supported clients.'],
  ['Invitation delivery delay', 'Resolved', 20, 'Leah', 'Queue drained; delivery checks complete.'],
  ['Export filename mismatch', 'Resolved', 0, 'Nia', 'Naming fixed; no affected sessions recorded.'],
] as const

const paragraphs = [
  ['CINDER / RELIABILITY FIELD NOTES', 'kicker'],
  ['The incident brief stays current.', 'title'],
  ['Shift handoff / 06 May 2029 / Original fictional service data', 'meta'],
  ['01 / Current picture', 'heading'],
  [
    'The register contains {{total}} incidents: {{open}} open, {{monitoring}} monitoring and {{resolved}} resolved. Monitoring means the mitigation is being observed; it is not the same as resolved.',
    'body',
  ],
  [
    'Open investigations account for {{openImpact}} affected sessions; monitored incidents account for {{monitoringImpact}}. The complete register records {{allImpact}} sessions, including resolved incidents.',
    'body',
  ],
  [
    'The resolved-record share is {{resolution}}. Open incidents average {{average}} affected sessions each. These are recorded session counts, not unique people or an availability measure.',
    'body',
  ],
  ['Briefing signal: {{signal}}.', 'signal'],
  ['02 / Working register', 'heading'],
  [
    'Double-click the native Base block and expand it to edit. Change a status or session count, then return to this summary. The numbers and signal are inline formulas; this prose is not regenerated.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'Start with search indexing: mark it Resolved. The open count moves from three to two, while historical affected sessions remain in the total. Move login to Monitoring to separate an active investigation from a mitigation under observation.',
    'body',
  ],
  [
    'Owners and next steps provide context, not numerical inputs. Filtering the Base view changes what is visible, not the whole-table references in this brief. A hidden record can still change a dependent total.',
    'body',
  ],
  ['04 / Read an empty queue honestly', 'heading'],
  [
    'When no incidents are Open, the native signal changes to No open investigations. The open-incident average has no denominator and deliberately exposes the native division error. Monitoring may still require follow-up; the signal does not declare the service healthy.',
    'body',
  ],
  ['Prepared for discussion / No automated paging, production connection or status-page publishing.', 'meta'],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = paragraphs.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Cinder / Incident briefing',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1000, height: 1000 },
      marginTop: 32,
      marginBottom: 36,
      marginLeft: 56,
      marginRight: 56,
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
          paragraphId: 'cinder-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'cinder-heading-' + i } : {}),
            spaceAbove: { v: heading ? 14 : 0 },
            spaceBelow: { v: 9 },
            lineSpacing: 1.3,
            textStyle: {
              ff: 'Arial',
              fs: kind === 'title' ? 32 : heading ? 17 : kind === 'meta' ? 10 : 14,
              bl: heading || kind === 'title' || kind === 'signal' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
              cl: {
                rgb:
                  kind === 'kicker' || kind === 'signal'
                    ? '#9A4E36'
                    : heading || kind === 'title'
                      ? '#243D49'
                      : '#485E68',
              },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'cinder-section' }],
    },
  }
}

export function createChildData(): IBaseSnapshot {
  const time = Date.parse('2029-05-06T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Incident', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Open', name: 'Open', color: '#C4785D' },
          { id: 'Monitoring', name: 'Monitoring', color: '#C7A45C' },
          { id: 'Resolved', name: 'Resolved', color: '#76A895' },
        ],
      },
    },
    { id: 'sessions', name: 'Sessions', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Next step', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    INCIDENTS.map(([title, status, sessions, owner, note], i) => {
      const id = 'incident-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, status, sessions, owner, note },
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
    tableOrder: ['incidents'],
    tables: {
      incidents: {
        id: 'incidents',
        name: 'Incidents',
        formulaName: 'Incidents',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['incidents-grid'],
        views: {
          'incidents-grid': {
            id: 'incidents-grid',
            tableId: 'incidents',
            name: 'Shift register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 250 : id === 'note' ? 370 : id === 'owner' ? 110 : 130,
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
