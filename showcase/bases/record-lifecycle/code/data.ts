import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { normalizeBaseDateSerial, serializeRecordLinkIds } from '@univerjs-pro/bases'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  ImageSourceType,
  LocaleType,
} from '@univerjs/core'

export const REVIEW_TIME = Date.parse('2027-03-31T09:00:00Z')
export const PEOPLE = [
  { id: 'ari', name: 'Ari Bell' },
  { id: 'hana', name: 'Hana Ito' },
  { id: 'mateo', name: 'Mateo Silva' },
  { id: 'zuri', name: 'Zuri Okafor' },
]
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
const status = field('status', 'Status', BaseFieldType.SingleSelect, {
  options: [
    { id: 'planned', name: 'Planned', color: '#64748b' },
    { id: 'active', name: 'In progress', color: '#2563eb' },
    { id: 'review', name: 'Review', color: '#d97706' },
    { id: 'done', name: 'Complete', color: '#059669' },
  ],
})
const person = field('owner', 'Coordinator', BaseFieldType.Person, { allowMultiple: true })
const date = field('due', 'Due date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false })
const relation = field('project', 'Installation', BaseFieldType.RecordLink, {
  targetTableId: 'projects',
  multiple: false,
  displayFieldId: 'title',
})
const attachment = (id: string, text: string) => ({
  id,
  name: `${id}.txt`,
  mimeType: 'text/plain',
  sourceType: ImageSourceType.BASE64,
  source: 'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
})
const projects = [
  'Tidal lanterns',
  'Clay sound wall',
  'Pocket orchard',
  'Reclaimed sail canopy',
  'Night map pavilion',
  'Neighbourhood portraits',
  'Rainwater instruments',
  'Paper tide archive',
  'Floating seed library',
  'Community weaving frame',
  'Solar story bench',
  'Harbour listening walk',
]
const titles = [
  'Test lantern suspension',
  'Label battery charging stations',
  'Photograph dusk rehearsal',
  'Pack ceramic resonators',
  'Record wall vibration sample',
  'Print sound-level guidance',
  'Check tree delivery route',
  'Refill accessible watering points',
  'Mark reusable planter crates',
  'Inspect sail stitching',
  'Map shade coverage at noon',
  'Brief canopy volunteers',
  'Proofread tactile map labels',
  'Calibrate pavilion projector',
  'Confirm evening access route',
  'Request portrait display consent',
  'Mount community photo captions',
  'Prepare take-home photo cards',
  'Tune rainwater chimes',
  'Flush instrument collection trays',
  'Publish wet-weather checklist',
  'Fold archive display sleeves',
  'Scan donated ferry tickets',
  'Check archive lighting',
  'Sort coastal seed packets',
  'Translate seed return cards',
  'Count library storage tins',
  'Tension community loom',
  'Reserve bench story sessions',
  'Walk listening route with guides',
]
function table(
  id: string,
  name: string,
  fields: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((item) => item.id)]
  const records = Object.fromEntries(
    rows.map((values, i) => {
      const recordId = `${id}-${String(i + 1).padStart(2, '0')}`
      return [
        recordId,
        {
          id: recordId,
          values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
          orderKey: `m${String(i).padStart(4, '0')}`,
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
        },
      ]
    }),
  )
  const viewId = `${id}-grid`
  return {
    id,
    name,
    formulaName: id,
    primaryFieldId: 'title',
    fields: {
      [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
      ...Object.fromEntries(fields.map((item) => [item.id, structuredClone(item)])),
    },
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [viewId],
    views: {
      [viewId]: {
        id: viewId,
        tableId: id,
        name: 'Manual record order',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((key) => [
            key,
            { hidden: key === BASE_RECORD_ID_FIELD_ID, width: key === 'title' ? 285 : key === 'project' ? 200 : 140 },
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
export function createData(state = 'default'): IBaseSnapshot {
  if (!['default', 'empty', 'boundary', 'error'].includes(state))
    throw new Error('Unknown fixture; current Base is unchanged.')
  const projectTable = table(
    'projects',
    'Festival installations',
    [
      field('title', 'Installation', BaseFieldType.Text),
      status,
      person,
      field('budget', 'Materials / USD', BaseFieldType.Number, { decimalPlaces: 2 }),
      date,
    ],
    projects.map((title, i) => ({
      title,
      status: ['active', 'review', 'planned', 'done'][i % 4],
      owner: [PEOPLE[i % 4].id],
      budget: 680 + 135 * i,
      due: normalizeBaseDateSerial(REVIEW_TIME + (10 + i) * 86400000),
    })),
  )
  const tasks = table(
    'tasks',
    'Production checklist',
    [
      field('title', 'Work item', BaseFieldType.Text),
      status,
      field('hours', 'Hours', BaseFieldType.Number, { decimalPlaces: 1 }),
      person,
      relation,
      date,
      field('brief', 'Working note', BaseFieldType.Attachment),
    ],
    titles.map((title, i) => ({
      title,
      status: ['planned', 'active', 'review', 'done'][i % 4],
      hours: i === 0 ? 0 : 0.5 + (i % 13) / 2,
      owner: i === 3 ? [] : [PEOPLE[(i + 1) % 4].id],
      project: serializeRecordLinkIds([`projects-${String(Math.min(12, Math.floor(i / 3) + 1)).padStart(2, '0')}`]),
      due: i === 4 ? null : normalizeBaseDateSerial(REVIEW_TIME + (i - 3) * 86400000),
      brief:
        i % 6 === 0
          ? [attachment(`brief-${i + 1}`, `Harbour Commons working note: ${title}. Original fictional demo material.`)]
          : [],
    })),
  )
  const milestones = table(
    'milestones',
    'Opening checkpoints',
    [
      field('title', 'Checkpoint', BaseFieldType.Text),
      relation,
      date,
      field('approved', 'Approved', BaseFieldType.Checkbox),
    ],
    Array.from({ length: 18 }, (_, i) => ({
      title: `${projects[i % 12]} / ${i < 12 ? 'setup review' : 'visitor walkthrough'}`,
      project: serializeRecordLinkIds([`projects-${String((i % 12) + 1).padStart(2, '0')}`]),
      due: normalizeBaseDateSerial(REVIEW_TIME + (i + 14) * 86400000),
      approved: i % 5 === 0,
    })),
  )
  if (state === 'empty') {
    tasks.records = {}
    tasks.recordOrder = []
  }
  if (state === 'boundary') {
    tasks.records['tasks-01'].values.title =
      'Test lantern suspension / identical display titles retain separate record IDs'
    tasks.records['tasks-02'].values.title = tasks.records['tasks-01'].values.title
    tasks.records['tasks-01'].values.hours = -0.5
    tasks.records['tasks-02'].values.hours = 99999.5
  }
  return {
    id: 'harbour-record-lifecycle',
    name: 'Harbour Commons arts weekend',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['tasks', 'projects', 'milestones'],
    tables: { tasks, projects: projectTable, milestones },
  }
}
export const INTAKE = [
  {
    title: 'Check lantern spare connectors',
    status: 'planned',
    hours: 1.5,
    owner: ['ari'],
    project: serializeRecordLinkIds(['projects-01']),
    due: normalizeBaseDateSerial(REVIEW_TIME + 86400000),
    brief: [],
  },
  {
    title: 'Pack quiet-hour visitor cards',
    status: 'active',
    hours: 0.5,
    owner: ['zuri'],
    project: serializeRecordLinkIds(['projects-02']),
    due: null,
    brief: [],
  },
  {
    title: 'Record seed-library handover',
    status: 'review',
    hours: 2.5,
    owner: ['hana', 'mateo'],
    project: serializeRecordLinkIds(['projects-09']),
    due: normalizeBaseDateSerial(REVIEW_TIME + 2 * 86400000),
    brief: [attachment('handover-note', 'Return unopened seed packets to the community library.')],
  },
] satisfies Record<string, BaseCellValue>[]
