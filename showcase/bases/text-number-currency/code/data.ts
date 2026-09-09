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
  { id: 'lina', name: 'Lina Moss' },
  { id: 'omar', name: 'Omar Chen' },
  { id: 'nora', name: 'Nora Reed' },
  { id: 'dev', name: 'Dev Shah' },
]
export const NUMBER_CONFIG = {
  decimalPlaces: 2,
  separatorStyle: 'commaPeriod',
  useThousands: true,
  abbreviation: 'none',
  allowNegative: true,
}
export const ADDED_FIELDS = [
  { name: 'Intake note', type: BaseFieldType.Text, config: {}, defaultValue: 'Needs triage' },
  { name: 'Spare units', type: BaseFieldType.Number, config: NUMBER_CONFIG, defaultValue: 2 },
  {
    name: 'Parts reserve',
    type: BaseFieldType.Currency,
    config: { ...NUMBER_CONFIG, currencySymbol: '$' },
    defaultValue: 12.5,
  },
]
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
const stations = [
  'Kitchen electrics',
  'Bicycle corner',
  'Textile mending',
  'Lamp clinic',
  'Audio bench',
  'Toy workshop',
  'Garden tools',
  'Furniture joinery',
  'Clock repair',
  'Small appliances',
  'Mobility accessories',
  'Community spares',
]
const jobs = [
  'Replace kettle handle',
  'Test toaster switch',
  'Clean blender coupling',
  'Align bicycle brakes',
  'Replace pump washer',
  'Patch cycle pannier',
  'Mend wool cardigan',
  'Shorten curtain lining',
  'Reinforce canvas tote',
  'Rewire desk lamp',
  'Replace shade bracket',
  'Check lantern contacts',
  'Clean radio volume control',
  'Resolder headphone jack',
  'Inspect speaker cone',
  'Repair wooden train axle',
  'Replace puzzle-box hinge',
  'Stitch stuffed fox',
  'Sharpen pruning shears',
  'Replace watering-can rose',
  'Rehandle garden fork',
  'Reglue dining chair',
  'Level bookcase feet',
  'Repair drawer runner',
  'Clean wall-clock movement',
  'Fit clock battery contact',
  'Check hand-mixer gears',
  'Repair walker pouch',
  'Replace cane ferrule',
  'Sort donated fasteners',
]
const quotes: BaseCellValue[] = [
  '1250.75',
  '36.50',
  '-8.25',
  '0',
  '',
  null,
  '1,250.75',
  'awaiting quote',
  '12kg',
  '0.125',
]
const link = field('station', 'Repair station', BaseFieldType.RecordLink, {
  targetTableId: 'stations',
  multiple: false,
  displayFieldId: 'title',
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
        name: 'Field comparison',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((key) => [
            key,
            { hidden: key === BASE_RECORD_ID_FIELD_ID, width: key === 'title' ? 240 : 150 },
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
    throw new Error('Unknown fixture; current content is unchanged.')
  const status = field('status', 'Progress', BaseFieldType.SingleSelect, {
    options: [
      { id: 'triage', name: 'Triage', color: '#d97706' },
      { id: 'bench', name: 'On bench', color: '#2563eb' },
      { id: 'done', name: 'Returned', color: '#059669' },
    ],
  })
  const owner = field('owner', 'Repair lead', BaseFieldType.Person, { allowMultiple: true })
  const due = field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false })
  const stationTable = table(
    'stations',
    'Workshop projects',
    [field('title', 'Project', BaseFieldType.Text), status, owner, due],
    stations.map((title, i) => ({
      title,
      status: ['triage', 'bench', 'done'][i % 3],
      owner: [PEOPLE[i % 4].id],
      due: normalizeBaseDateSerial(REVIEW_TIME + i * 86400000),
    })),
  )
  const repairs = table(
    'repairs',
    'Repair intake',
    [
      field('title', 'Repair job', BaseFieldType.Text),
      field('units', 'Parts units', BaseFieldType.Number, { ...NUMBER_CONFIG, decimalPlaces: 3 }),
      field('reserve', 'Reserve / USD', BaseFieldType.Currency, { ...NUMBER_CONFIG, currencySymbol: '$' }),
      field('quote', 'Submitted quote / text', BaseFieldType.Text),
      field('note', 'Bench note', BaseFieldType.Text),
      status,
      owner,
      due,
      link,
      field('brief', 'Intake brief', BaseFieldType.Attachment),
    ],
    jobs.map((title, i) => ({
      title,
      units: [1250.75, 0, -8.25, 3, 0.125, 42.5][i % 6],
      reserve: Math.round((8.75 + i * 3.625) * 100) / 100,
      quote: quotes[i % quotes.length],
      note:
        i % 7 === 0
          ? 'Ask before replacing original parts.'
          : i % 5 === 0
            ? 'Retain original parts · owner’s request'
            : `Tray ${String.fromCharCode(65 + (i % 6))} / slot ${i + 1}`,
      status: ['triage', 'bench', 'done'][i % 3],
      owner: [PEOPLE[i % 4].id],
      due: i % 8 === 0 ? null : normalizeBaseDateSerial(REVIEW_TIME + i * 86400000),
      station: serializeRecordLinkIds([`stations-${String((i % 12) + 1).padStart(2, '0')}`]),
      brief:
        i % 9 === 0
          ? [
              {
                id: `repair-brief-${i}`,
                name: `repair-${i + 1}.txt`,
                mimeType: 'text/plain',
                sourceType: ImageSourceType.BASE64,
                source:
                  'data:text/plain;charset=utf-8,' +
                  encodeURIComponent(`${title}: obtain owner approval before replacing parts.`),
              },
            ]
          : [],
    })),
  )
  const checks = table(
    'checks',
    'Return checks',
    [field('title', 'Check', BaseFieldType.Text), link, due, field('passed', 'Passed', BaseFieldType.Checkbox)],
    Array.from({ length: 18 }, (_, i) => ({
      title: `${stations[i % 12]} / ${i < 12 ? 'bench review' : 'owner handover'}`,
      station: serializeRecordLinkIds([`stations-${String((i % 12) + 1).padStart(2, '0')}`]),
      due: normalizeBaseDateSerial(REVIEW_TIME + (i + 7) * 86400000),
      passed: i % 4 === 0,
    })),
  )
  if (state === 'empty') {
    repairs.records = {}
    repairs.recordOrder = []
  }
  if (state === 'boundary') {
    repairs.records['repairs-01'].values.units = 0.0001
    repairs.records['repairs-02'].values.units = 9999999.875
    repairs.records['repairs-03'].values.note = 'Thread colour — café repair; retain the original. '.repeat(8)
  }
  if (state === 'error') {
    repairs.records['repairs-01'].values.quote = 'not a number'
    repairs.records['repairs-02'].values.quote = '1,250.75'
    repairs.records['repairs-03'].values.quote = '12kg'
  }
  return {
    id: 'bracken-field-lab',
    name: 'Bracken repair café / field lab',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['repairs', 'stations', 'checks'],
    tables: { repairs, stations: stationTable, checks },
  }
}
