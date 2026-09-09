import type { IBaseSnapshot, IFieldSnapshot, IViewSnapshot } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseFilterConjunction,
  BaseFilterOperator,
  BaseSortDirection,
  BaseViewType,
  createBaseRecordIdField,
} from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const count = 5000
  const time = Date.parse('2027-05-01T09:00:00Z')
  const regions = ['North', 'South', 'East', 'West', 'Central']
  const states = ['Queued', 'Packed', 'Shipped', 'Review']
  const fields: IFieldSnapshot[] = [
    { id: 'name', name: 'Dispatch', type: BaseFieldType.Text, config: {} },
    { id: 'region', name: 'Region', type: BaseFieldType.Text, config: {} },
    {
      id: 'state',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: states.map((name, i) => ({ id: name, name, color: ['blue', 'purple', 'green', 'orange'][i] })),
      },
    },
    { id: 'units', name: 'Units', type: BaseFieldType.Number, config: {} },
    { id: 'amount', name: 'Value / USD', type: BaseFieldType.Number, config: { decimalPlaces: 2 } },
    { id: 'note', name: 'Handling note', type: BaseFieldType.Text, config: {} },
  ]
  const records = Object.fromEntries(
    Array.from({ length: count }, (_, i) => {
      const id = 'dispatch-' + String(i + 1).padStart(5, '0')
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(5, '0'),
          createdAt: time,
          updatedAt: time,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            name:
              ['Ceramics', 'Books', 'Seeds', 'Lighting', 'Textiles', 'Tools', 'Stationery'][i % 7] +
              ' / ' +
              String(i + 1).padStart(5, '0'),
            region: regions[i % 5],
            state: states[Math.floor(i / 5) % 4],
            units: (i * 7) % 101,
            amount: ((i * 137) % 100000) / 100,
            note:
              i % 11 === 0
                ? null
                : ['Keep dry', 'Reusable packaging', 'Morning collection', 'Inspect seal'][Math.floor(i / 7) % 4],
          },
        },
      ]
    }),
  )
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((f) => f.id)]
  const views: IViewSnapshot[] = [
    ['all', 'All 5,000 dispatches'],
    ['north', 'North / 1,000 records'],
    ['grouped', 'Region / highest value first'],
  ].map(([id, name]) => ({
    id,
    name,
    tableId: 'dispatches',
    type: BaseViewType.Grid,
    fieldOrder,
    fieldSettings: Object.fromEntries(
      fieldOrder.map((fieldId) => [
        fieldId,
        {
          hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
          width: fieldId === 'name' ? 230 : fieldId === 'note' ? 215 : 145,
        },
      ]),
    ),
    filter:
      id === 'north'
        ? {
            conjunction: BaseFilterConjunction.AND,
            conditions: [{ fieldId: 'region', operator: BaseFilterOperator.IS, operand: 'North' }],
          }
        : null,
    sort: id === 'grouped' ? [{ fieldId: 'amount', direction: BaseSortDirection.DESC }] : [],
    group: id === 'grouped' ? [{ fieldId: 'region', direction: BaseSortDirection.ASC }] : [],
    config: { frozenFieldCount: 1, rowHeight: 'short', showRecordIndex: true, fieldStats: { name: 'count' } },
  }))
  return {
    id: 'large-record-set',
    name: 'Dispatch archive / 5,000 records',
    schemaVersion: 1,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['dispatches'],
    tables: {
      dispatches: {
        id: 'dispatches',
        name: 'Dispatch archive',
        primaryFieldId: 'name',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((f) => [f.id, f])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        views: Object.fromEntries(views.map((v) => [v.id, v])),
        viewOrder: views.map((v) => v.id),
      },
    },
  }
}
