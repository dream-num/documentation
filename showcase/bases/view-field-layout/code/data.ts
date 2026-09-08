import {
  BASE_RECORD_ID_FIELD_ID,
  createBaseRecordIdField,
  BaseFieldType,
  BaseViewType,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type IGridViewConfig,
} from '@univerjs/core'
// Original synthetic data authored for this demo. No third-party assets or live services.
// Distribution terms are determined by the repository owner.
const timestamp = 1806537600000
const fields: IFieldSnapshot[] = [
  { id: 'sample', name: 'Sample', type: BaseFieldType.Text, config: {} },
  { id: 'habitat', name: 'Habitat', type: BaseFieldType.Text, config: {} },
  { id: 'temperature', name: 'Temperature °C', type: BaseFieldType.Number, config: {} },
  { id: 'ph', name: 'pH', type: BaseFieldType.Number, config: {} },
  { id: 'notes', name: 'Field notes', type: BaseFieldType.Text, config: {} },
  { id: 'batch', name: 'Lab batch', type: BaseFieldType.Text, config: {} },
]
export function createData(_legacyLocale = false): IBaseSnapshot {
  const data = structuredClone(DATA)
  const table = data.tables.records
  table.views = Object.fromEntries(VARIANTS.map((variant) => [variant.id, view(variant.id, variant.label)]))
  table.viewOrder = VARIANTS.map((variant) => variant.id)
  return data
}
const rows = [
  ['S-101 · North inlet', 'Reed bed', 16.8, 7.2, 'Collected after rainfall; low turbidity.', 'B-41'],
  ['S-102 · Sand bar', 'Intertidal', 18.4, 7.8, 'Duplicate bottle reserved for calibration.', 'B-41'],
  ['S-103 · Willow reach', 'Freshwater', 15.1, 6.9, 'Shaded sampling point. Temperature repeated twice.', 'B-42'],
  ['S-104 · Old pier', 'Brackish', 17.6, 7.5, 'Biofilm visible on the lower piling.', 'B-42'],
  [
    'S-105 · Salt marsh',
    'Marsh',
    19.2,
    8.1,
    'Long note: field team recorded a small tidal pool, recent vegetation growth, and a damaged marker that needs replacement before the next survey.',
    'B-43',
  ],
  ['S-106 · East channel', 'Open water', null, 7.7, 'Temperature probe unavailable.', null],
  ['S-107 · Creek mouth', 'Freshwater', 14.9, null, 'pH reading pending laboratory confirmation.', 'B-44'],
  ['S-108 · Dune edge', 'Intertidal', 20.3, 8, 'Reference site; no unusual observations.', 'B-44'],
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
      { hidden: field === BASE_RECORD_ID_FIELD_ID, width: field === 'sample' ? 240 : field === 'notes' ? 340 : 150 },
    ]),
  ),
  filter: null,
  sort: [],
  group: [],
  config: { frozenFieldCount: 1, rowHeight: 'medium' as const, showRecordIndex: true },
})
export const DATA: IBaseSnapshot = {
  id: 'view-field-layout-base',
  name: 'Estuary samples',
  schemaVersion: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  tableOrder: ['records'],
  tables: {
    records: {
      id: 'records',
      name: 'Estuary samples',
      formulaName: 'DemoRecords',
      primaryFieldId: 'sample',
      fields: {
        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
        ...Object.fromEntries(fields.map((field) => [field.id, field])),
      },
      fieldOrder,
      records,
      recordOrder: Object.keys(records),
      views: { working: view('working', 'Working view'), reference: view('reference', 'Reference view') },
      viewOrder: ['working', 'reference'],
    },
  },
}
export const VARIANTS: {
  id: string
  label: string
  order: string[]
  visible: string[]
  rowHeight: IGridViewConfig['rowHeight']
  frozen: number
  width: number
}[] = [
  {
    id: 'full',
    label: 'Full record',
    order: ['sample', 'habitat', 'temperature', 'ph', 'notes', 'batch'],
    visible: ['sample', 'habitat', 'temperature', 'ph', 'notes', 'batch'],
    rowHeight: 'medium',
    frozen: 1,
    width: 240,
  },
  {
    id: 'compact',
    label: 'Compact fieldwork',
    order: ['sample', 'habitat', 'temperature', 'ph', 'notes', 'batch'],
    visible: ['sample', 'habitat', 'temperature', 'ph'],
    rowHeight: 'short',
    frozen: 1,
    width: 180,
  },
  {
    id: 'review',
    label: 'Notes-first review',
    order: ['sample', 'notes', 'habitat', 'temperature', 'ph', 'batch'],
    visible: ['sample', 'notes', 'habitat', 'temperature', 'ph', 'batch'],
    rowHeight: 'extraTall',
    frozen: 2,
    width: 280,
  },
  {
    id: 'lab',
    label: 'Lab handover',
    order: ['sample', 'batch', 'ph', 'temperature', 'habitat', 'notes'],
    visible: ['sample', 'batch', 'ph', 'temperature'],
    rowHeight: 'tall',
    frozen: 2,
    width: 220,
  },
]
