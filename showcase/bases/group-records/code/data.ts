import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseSortDirection,
  BaseViewType,
  createBaseRecordIdField,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type IGroupConfig,
} from '@univerjs/core'

// Original fictional touring-equipment returns. Deterministic, not random or live.
export const FROZEN_TIME = Date.parse('2027-03-31T09:00:00Z')
export const STATUSES = ['Queued', 'Inspecting', 'Repair', 'Done', 'Archived']
const fields: IFieldSnapshot[] = [
  { id: 'item', name: 'Return item', type: BaseFieldType.Text, config: {} },
  {
    id: 'status',
    name: 'Status',
    type: BaseFieldType.SingleSelect,
    config: {
      options: STATUSES.map((name, i) => ({
        id: name,
        name,
        color: ['#64748b', '#2563eb', '#d97706', '#059669', '#7c3aed'][i],
      })),
    },
  },
  { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
  { id: 'region', name: 'Region', type: BaseFieldType.Text, config: {} },
  { id: 'due', name: 'Return due', type: BaseFieldType.Date, config: { format: 'yyyy-MM-dd' } },
  { id: 'amount', name: 'Repair estimate / USD', type: BaseFieldType.Number, config: {} },
]
const routes = ['Dune', 'Creek', 'Ridge', 'Harbor', 'Market', 'Orchard']
const kits = ['Cable kit', 'LED wash', 'Monitor pair', 'Radio pack', 'Power rack']
export const ROWS = Array.from({ length: 16 }, (_, i) => ({
  id: 'r' + String(i + 1).padStart(3, '0'),
  item: routes[i % 6] + ' / ' + kits[i % 5] + ' / batch ' + String(Math.floor(i / 30) + 1).padStart(2, '0'),
  status: i % 13 === 0 ? null : STATUSES[i % 4],
  owner: i % 7 === 0 ? null : ['Lena', 'Omar', 'Keiko'][Math.floor(i / 4) % 3],
  region: ['Coast', 'Inland', 'North'][i % 3],
  due: i % 11 === 0 ? null : FROZEN_TIME + ((i % 17) - 8) * 86400000,
  amount: i % 9 === 0 ? null : i % 10 === 0 ? 0 : 25 + ((i * 37) % 475),
}))
const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
const view = (id: string, name: string) => ({
  id,
  name,
  tableId: 'returns',
  type: BaseViewType.Grid,
  fieldOrder: [...fieldOrder],
  fieldSettings: Object.fromEntries(
    fieldOrder.map((field) => [
      field,
      { hidden: field === BASE_RECORD_ID_FIELD_ID, width: field === 'item' ? 270 : 160 },
    ]),
  ),
  filter: null,
  sort: [],
  group: [] as IGroupConfig[],
  config: { frozenFieldCount: 1, rowHeight: 'short' as const, showRecordIndex: true },
})
export function createData(_legacyLocale = false): IBaseSnapshot {
  const records = Object.fromEntries(
    ROWS.map(({ id, ...values }, i) => [
      id,
      {
        id,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, ...values },
        orderKey: String(i).padStart(3, '0'),
        createdAt: FROZEN_TIME,
        updatedAt: FROZEN_TIME,
      },
    ]),
  )
  return {
    id: 'mistral-groups',
    name: 'Record grouping comparisons',
    schemaVersion: 1,
    createdAt: FROZEN_TIME,
    updatedAt: FROZEN_TIME,
    tableOrder: ['returns'],
    tables: {
      returns: {
        id: 'returns',
        name: 'Equipment',
        formulaName: 'TouringReturns',
        primaryFieldId: 'item',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, { ...field }])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        views: Object.fromEntries(VARIANTS.map((variant) => [variant.id, view(variant.id, variant.label)])),
        viewOrder: VARIANTS.map((variant) => variant.id),
      },
    },
  }
}
export const VARIANTS: { id: string; label: string; group: IGroupConfig[] }[] = [
  { id: 'none', label: 'No grouping', group: [] },
  { id: 'status', label: 'Status · ascending', group: [{ fieldId: 'status', direction: BaseSortDirection.ASC }] },
  { id: 'reverse', label: 'Status · descending', group: [{ fieldId: 'status', direction: BaseSortDirection.DESC }] },
  {
    id: 'nested',
    label: 'Status → owner',
    group: [
      { fieldId: 'status', direction: BaseSortDirection.ASC },
      { fieldId: 'owner', direction: BaseSortDirection.ASC },
    ],
  },
  {
    id: 'region',
    label: 'Region → status',
    group: [
      { fieldId: 'region', direction: BaseSortDirection.DESC },
      { fieldId: 'status', direction: BaseSortDirection.ASC },
    ],
  },
  {
    id: 'empty-shown',
    label: 'Show empty groups · SDK flag',
    group: [{ fieldId: 'status', direction: BaseSortDirection.ASC, hideEmptyGroup: false }],
  },
  {
    id: 'empty-hidden',
    label: 'Hide empty groups · SDK flag',
    group: [{ fieldId: 'status', direction: BaseSortDirection.ASC, hideEmptyGroup: true }],
  },
]
