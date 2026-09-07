import {
  BASE_RECORD_ID_FIELD_ID,
  createBaseRecordIdField,
  BaseSortDirection,
  BaseFieldType,
  BaseViewType,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type ISortConfig,
} from '@univerjs/core'
// Original synthetic data authored for this demo. No third-party assets or live services.
// Distribution terms are determined by the repository owner.
const timestamp = 1806537600000
const fields: IFieldSnapshot[] = [
  { id: 'instrument', name: 'Instrument', type: BaseFieldType.Text, config: {} },
  { id: 'score', name: 'Readiness score', type: BaseFieldType.Number, config: {} },
  { id: 'zone', name: 'Zone', type: BaseFieldType.Text, config: {} },
  { id: 'next', name: 'Next calibration', type: BaseFieldType.Date, config: { pattern: 'yyyy/mm/dd' } },
]
const rows = [
  ['Meridian Pump', 82, 'West', 1807531200000],
  ['Atlas Scale', 95, 'East', 1807358400000],
  ['Beacon Meter', 82, 'West', 1807185600000],
  ['Cobalt Probe', 82, 'West', 1807185600000],
  ['Delta Valve', 0, 'East', null],
  ['Elm Sensor', null, 'North', 1807790400000],
  ['Flux Gauge', 95, 'East', 1807272000000],
  ['Grove Relay', 67, 'North', 1807358400000],
  ['Harbor Thermostat', -5, 'West', 1808222400000],
  ['Indigo Sampler', 95, 'East', 1807272000000],
]
const records = Object.fromEntries(
  rows.map((values, index) => {
    const id = 'r' + String(index + 1).padStart(2, '0')
    return [
      id,
      {
        id,
        values: {
          [BASE_RECORD_ID_FIELD_ID]: id,
          ...Object.fromEntries(fields.map((field, column) => [field.id, values[column]])),
        },
        orderKey: String(index).padStart(3, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]
  }),
)
const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
const view = (id: string, name: string) => ({
  id,
  tableId: 'records',
  name,
  type: BaseViewType.Grid,
  fieldOrder: [...fieldOrder],
  fieldSettings: Object.fromEntries(
    fieldOrder.map((field) => [
      field,
      {
        hidden: field === BASE_RECORD_ID_FIELD_ID,
        width: field === 'instrument' ? 240 : field === 'notes' ? 340 : 150,
      },
    ]),
  ),
  filter: null,
  sort: [],
  group: [],
  config: { frozenFieldCount: 1, rowHeight: 'medium' as const, showRecordIndex: true },
})
export const DATA: IBaseSnapshot = {
  id: 'multi-field-sort-base',
  name: 'Calibration queue',
  schemaVersion: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  tableOrder: ['records'],
  tables: {
    records: {
      id: 'records',
      name: 'Calibration queue',
      formulaName: 'DemoRecords',
      primaryFieldId: 'instrument',
      fields: {
        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
        ...Object.fromEntries(fields.map((field) => [field.id, field])),
      },
      fieldOrder,
      records,
      recordOrder: Object.keys(records),
      views: { working: view('working', 'Working view') },
      viewOrder: ['working'],
    },
  },
}
export const VARIANTS: { id: string; label: string; sort: ISortConfig[] }[] = [
  {
    id: 'original',
    label: 'Original order',
    sort: [],
  },
  {
    id: 'score-desc',
    label: 'Score · highest first',
    sort: [
      {
        fieldId: 'score',
        direction: BaseSortDirection.DESC,
      },
    ],
  },
  {
    id: 'score-asc',
    label: 'Score · lowest first',
    sort: [
      {
        fieldId: 'score',
        direction: BaseSortDirection.ASC,
      },
    ],
  },
  {
    id: 'zone-score',
    label: 'Zone ↑ then score ↓',
    sort: [
      {
        fieldId: 'zone',
        direction: BaseSortDirection.ASC,
      },
      {
        fieldId: 'score',
        direction: BaseSortDirection.DESC,
      },
    ],
  },
  {
    id: 'date-score',
    label: 'Date ↑ then score ↓',
    sort: [
      {
        fieldId: 'next',
        direction: BaseSortDirection.ASC,
      },
      {
        fieldId: 'score',
        direction: BaseSortDirection.DESC,
      },
    ],
  },
  {
    id: 'name-desc',
    label: 'Instrument · Z to A',
    sort: [
      {
        fieldId: 'instrument',
        direction: BaseSortDirection.DESC,
      },
    ],
  },
]
