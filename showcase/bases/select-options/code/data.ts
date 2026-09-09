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
  { id: 'ada', name: 'Ada Vale' },
  { id: 'ren', name: 'Ren Okafor' },
  { id: 'min', name: 'Min Reyes' },
  { id: 'leo', name: 'Leo Park' },
]
export const PRIORITIES = [
  { id: 'high', name: 'High', color: '#ef4444' },
  { id: 'normal', name: 'Normal', color: '#2563eb' },
  { id: 'low', name: 'Low', color: '#16a34a' },
  { id: 'seasonal', name: 'Seasonal / unused', color: '#9333ea' },
]
export const HABITATS = [
  { id: 'rockpool', name: 'Rock pools', color: '#0891b2' },
  { id: 'eelgrass', name: 'Eelgrass', color: '#16a34a' },
  { id: 'dunes', name: 'Dunes', color: '#d97706' },
  { id: 'birds', name: 'Shorebirds', color: '#9333ea' },
  { id: 'archive', name: 'Archive / unused', color: '#64748b' },
]
export type SelectOption = (typeof PRIORITIES)[number]
export const NEW_OPTION: SelectOption = { id: 'weather', name: 'Weather watch', color: '#db2777' }
export function optionIds(value: unknown): string[] {
  return value == null || value === '' ? [] : Array.isArray(value) ? value.map(String) : [String(value)]
}
const sites = [
  'Lantern Cove',
  'Saltmarsh Gate',
  'Pebble Reach',
  'North Dunes',
  'Willow Estuary',
  'Old Jetty',
  'Heron Inlet',
  'Copper Point',
  'Shell Bay',
  'East Sandbar',
  'Reed Lagoon',
  'Beacon Strand',
]
const tasks = [
  'Map Lantern Cove rock pools',
  'Count juvenile crabs',
  'Calibrate salinity probe',
  'Photograph saltmarsh transect',
  'Replace boardwalk marker',
  'Measure eelgrass canopy',
  'Collect pebble microplastics',
  'Check nesting exclusion rope',
  'Survey dune grass cover',
  'Record high-tide wrack line',
  'Test estuary turbidity',
  'Recheck freshwater outfall',
  'Inspect jetty sensor bracket',
  'Log nighttime water temperature',
  'Count heron feeding visits',
  'Map exposed mudflat edge',
  'Check Copper Point safety sign',
  'Sample shaded pool oxygen',
  'Measure Shell Bay erosion pins',
  'Review volunteer tide briefing',
  'Mark sandbar access corridor',
  'Count shorebird flocks',
  'Inspect lagoon sampling valve',
  'Record reed-bed water depth',
  'Check Beacon Strand litter traps',
  'Repeat dawn photo station',
  'Audit specimen vial labels',
  'Verify GPS track coverage',
  'Summarize storm exposure notes',
  'Prepare community survey handover',
]
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
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
        name: 'Option lab',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((key) => [
            key,
            { hidden: key === BASE_RECORD_ID_FIELD_ID, width: key === 'title' ? 290 : key === 'habitats' ? 270 : 150 },
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
    throw new Error('Unknown fixture; current data is unchanged.')
  const priority = {
    ...field('priority', 'Priority', BaseFieldType.SingleSelect, {
      options: PRIORITIES,
      optionSource: { type: 'manual' },
    }),
    defaultValue: 'normal',
  }
  const habitats = {
    ...field('habitats', 'Habitats', BaseFieldType.MultiSelect, {
      options: HABITATS,
      optionSource: { type: 'manual' },
    }),
    defaultValue: ['rockpool'],
  }
  const owner = field('owner', 'Survey lead', BaseFieldType.Person, { allowMultiple: true })
  const due = field('due', 'Survey date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false })
  const site = field('site', 'Coastal project', BaseFieldType.RecordLink, {
    targetTableId: 'sites',
    multiple: false,
    displayFieldId: 'title',
  })
  const projects = table(
    'sites',
    'Coastal projects',
    [field('title', 'Site', BaseFieldType.Text), owner, due, priority],
    sites.map((title, i) => ({
      title,
      owner: [PEOPLE[i % 4].id],
      due: normalizeBaseDateSerial(REVIEW_TIME + i * 86400000),
      priority: PRIORITIES[i % 3].id,
    })),
  )
  const surveys = table(
    'surveys',
    'Survey checklist',
    [
      field('title', 'Survey task', BaseFieldType.Text),
      priority,
      habitats,
      field('samples', 'Samples', BaseFieldType.Number, { decimalPlaces: 0 }),
      owner,
      due,
      site,
      field('note', 'Field note', BaseFieldType.Text),
      field('brief', 'Field brief', BaseFieldType.Attachment),
    ],
    tasks.map((title, i) => ({
      title,
      priority: i === 5 ? null : PRIORITIES[i % 3].id,
      habitats: [
        ['rockpool', 'eelgrass'],
        ['birds'],
        [],
        ['dunes', 'birds'],
        ['eelgrass'],
        ['rockpool', 'dunes', 'birds'],
      ][i % 6],
      samples: [8, 0, 12, 3, 25, 1, 7][i % 7],
      owner: [PEOPLE[i % 4].id],
      due: normalizeBaseDateSerial(REVIEW_TIME + (i % 14) * 86400000),
      site: serializeRecordLinkIds([`sites-${String((i % 12) + 1).padStart(2, '0')}`]),
      note:
        i % 6 === 0
          ? 'Low tide only — check access before entering'
          : `${sites[i % 12]} / transect ${String.fromCharCode(65 + (i % 5))} / ${i + 1} m`,
      brief:
        i % 10 === 0
          ? [
              {
                id: `sable-brief-${i}`,
                name: `survey-${i + 1}.txt`,
                mimeType: 'text/plain',
                sourceType: ImageSourceType.BASE64,
                source:
                  'data:text/plain;charset=utf-8,' +
                  encodeURIComponent(`${title}: check tide and buddy assignment before entering the shore.`),
              },
            ]
          : [],
    })),
  )
  const samples = table(
    'samples',
    'Sample handovers',
    [field('title', 'Handover', BaseFieldType.Text), site, due, field('received', 'Received', BaseFieldType.Checkbox)],
    Array.from({ length: 18 }, (_, i) => ({
      title: `${sites[i % 12]} / ${i < 12 ? 'water sample' : 'sediment resample'}`,
      site: serializeRecordLinkIds([`sites-${String((i % 12) + 1).padStart(2, '0')}`]),
      due: normalizeBaseDateSerial(REVIEW_TIME + (i + 4) * 86400000),
      received: i % 3 !== 0,
    })),
  )
  if (state === 'empty') {
    surveys.records = {}
    surveys.recordOrder = []
  }
  if (state === 'boundary') {
    surveys.records['surveys-01'].values.habitats = HABITATS.slice(0, 4).map((item) => item.id)
    surveys.records['surveys-02'].values.priority = null
    surveys.records['surveys-02'].values.habitats = []
    const clonedOptions = surveys.fields.habitats.config.options as SelectOption[]
    clonedOptions.find((item) => item.id === 'rockpool')!.name = 'Rock pools — sheltered shoreline and tidal habitats'
  }
  if (state === 'error') {
    surveys.records['surveys-01'].values.priority = 'retired-priority'
    surveys.records['surveys-02'].values.habitats = ['rockpool', 'retired-habitat']
  }
  return {
    id: 'sable-option-lab',
    name: 'Sable coastal observatory / option lab',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['surveys', 'sites', 'samples'],
    tables: { surveys, sites: projects, samples },
  }
}
