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
  { id: 'nia', name: 'Nia Park' },
  { id: 'tomas', name: 'Tomás Reyes' },
  { id: 'sora', name: 'Sora Chen' },
  { id: 'imani', name: 'Imani Cole' },
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
    { id: 'review', name: 'In review', color: '#d97706' },
    { id: 'done', name: 'Complete', color: '#059669' },
  ],
})
const owner = field('owner', 'Responsible person', BaseFieldType.Person, { allowMultiple: true })
const due = field('due', 'Due date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false })
const relation = field('project', 'Related project', BaseFieldType.RecordLink, {
  targetTableId: 'projects',
  multiple: false,
  displayFieldId: 'title',
})
const attachment = (id: string, name: string, text: string) => ({
  id,
  name,
  mimeType: 'text/plain',
  sourceType: ImageSourceType.BASE64,
  source: 'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
})
const projectTitles = [
  'Foyer accessibility',
  'Lighting bridge',
  'Costume archive',
  'Studio acoustics',
  'Stage power',
  'Community kitchen',
  'Rehearsal rooms',
  'Box-office kiosk',
  'Roof inspection',
  'Garden seating',
  'Scenery storage',
  'Volunteer training',
]
const tasks = [
  'Measure foyer turning circle',
  'Confirm lift clearance',
  'Order tactile wayfinding',
  'Audit lighting circuits',
  'Label dimmer channels',
  'Test emergency lamps',
  'Catalogue winter costumes',
  'Scan donation receipts',
  'Repair garment rails',
  'Measure reverberation time',
  'Install wall absorbers',
  'Retest spoken-word clarity',
  'Survey stage outlets',
  'Replace damaged sockets',
  'Sign off load schedule',
  'Check kitchen extraction',
  'Fit induction hob',
  'Run food-safety briefing',
  'Calibrate rehearsal piano',
  'Repair sprung floor',
  'Publish room-booking guide',
  'Trial accessible ticket flow',
  'Connect receipt printer',
  'Train box-office volunteers',
  'Inspect roof flashing',
  'Clear rainwater outlets',
  'Build shaded bench',
  'Number scenery bays',
  'Revise lifting checklist',
  'Schedule volunteer induction',
]

function table(
  id: string,
  name: string,
  fields: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((item) => item.id)]
  const records = Object.fromEntries(
    rows.map((values, index) => {
      for (const definition of fields) {
        if (definition.type === BaseFieldType.RecordLink)
          values[definition.id] = serializeRecordLinkIds(values[definition.id] as string[])
      }
      const recordId = `${id}-${String(index + 1).padStart(2, '0')}`
      return [
        recordId,
        {
          id: recordId,
          values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
          orderKey: String(index).padStart(3, '0'),
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
        name: 'Working grid',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((key) => [
            key,
            {
              hidden: key === BASE_RECORD_ID_FIELD_ID,
              width: key === 'title' ? 245 : key === 'owner' || key === 'project' ? 185 : 140,
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

export function createData(state = 'default'): IBaseSnapshot {
  if (!['default', 'empty', 'boundary', 'error'].includes(state))
    throw new Error('Unknown Relational Table state; existing data was not replaced.')
  const projects = table(
    'projects',
    'Renovation projects',
    [
      field('title', 'Project', BaseFieldType.Text),
      status,
      field('budget', 'Budget / USD', BaseFieldType.Number, { decimalPlaces: 2 }),
      owner,
      due,
      field('brief', 'Project brief', BaseFieldType.Attachment),
    ],
    projectTitles.map((title, i) => ({
      title,
      status: ['active', 'review', 'planned', 'done'][i % 4],
      budget: i === 11 ? 0 : 1200 + i * 875,
      owner: i % 5 === 0 ? ['nia', 'imani'] : [PEOPLE[i % PEOPLE.length].id],
      due: normalizeBaseDateSerial(REVIEW_TIME + (i * 3 - 8) * 86400000),
      brief:
        i % 3 === 0
          ? [
              attachment(
                `brief-${i}`,
                `project-${i + 1}-brief.txt`,
                `${title}\nLumen community theatre renewal\nReview: 31 March 2027\nOriginal demonstration attachment.`,
              ),
            ]
          : [],
    })),
  )
  const work = table(
    'tasks',
    'Work packages',
    [
      field('title', 'Work package', BaseFieldType.Text),
      status,
      relation,
      owner,
      field('hours', 'Estimated hours', BaseFieldType.Number, { decimalPlaces: 1 }),
      due,
    ],
    tasks.map((title, i) => ({
      title,
      status: ['planned', 'active', 'review', 'done'][i % 4],
      project: [`projects-${String(Math.min(12, Math.floor(i / 3) + 1)).padStart(2, '0')}`],
      owner: [PEOPLE[(i + 1) % PEOPLE.length].id],
      hours: 0.5 + ((i * 3) % 21) / 2,
      due: normalizeBaseDateSerial(REVIEW_TIME + (i - 6) * 86400000),
    })),
  )
  const milestones = table(
    'milestones',
    'Acceptance milestones',
    [
      field('title', 'Milestone', BaseFieldType.Text),
      relation,
      due,
      field('passed', 'Accepted', BaseFieldType.Checkbox),
      field('evidence', 'Evidence note', BaseFieldType.Attachment),
    ],
    Array.from({ length: 18 }, (_, i) => ({
      title: `${projectTitles[i % 12]} · ${i < 12 ? 'site review' : 'handover'}`,
      project: [`projects-${String((i % 12) + 1).padStart(2, '0')}`],
      due: normalizeBaseDateSerial(REVIEW_TIME + (i * 2 + 4) * 86400000),
      passed: i % 4 === 0,
      evidence:
        i % 4 === 0
          ? [
              attachment(
                `evidence-${i}`,
                `inspection-${i + 1}.txt`,
                `Lumen inspection ${i + 1}\nDemonstration evidence only; no real safety certification.`,
              ),
            ]
          : [],
    })),
  )
  const data: IBaseSnapshot = {
    id: 'lumen-base-lifecycle',
    name: 'Lumen community theatre renewal',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['projects', 'tasks', 'milestones'],
    tables: { projects, tasks: work, milestones },
  }
  if (state === 'empty') {
    projects.records = {}
    projects.recordOrder = []
    data.tables = { projects }
    data.tableOrder = ['projects']
  }
  if (state === 'boundary') {
    data.tableOrder = ['milestones', 'tasks', 'projects']
    projects.name = 'Lumen accessibility review 2027'
    projects.records['projects-01'].values.budget = 0
    projects.records['projects-12'].values.budget = 999999.99
  }
  return data
}

export const NEW_ROWS = [
  { title: 'Collect paint colour samples', owner: 'nia', status: 'planned' },
  { title: 'Approve recycled timber finish', owner: 'imani', status: 'active' },
  { title: 'Publish volunteer shift handover', owner: 'tomas', status: 'review' },
]
