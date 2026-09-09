import type { IBaseSnapshot, IFieldSnapshot, IGroupConfig } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseSortDirection,
  BaseViewType,
  createBaseRecordIdField,
} from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const fields: IFieldSnapshot[] = [
    { id: 'item', name: 'Entry', type: BaseFieldType.Text, config: {} },
    { id: 'team', name: 'Studio', type: BaseFieldType.Text, config: {} },
    { id: 'amount', name: 'Amount / USD', type: BaseFieldType.Number, config: { decimalPlaces: 2 } },
    { id: 'units', name: 'Units', type: BaseFieldType.Number, config: {} },
    { id: 'memo', name: 'Receipt note', type: BaseFieldType.Text, config: {} },
  ]
  const rows = [
    ['Workshop booking', 'North', 120, 2, 'receipt'],
    ['Refund adjustment', 'North', -20, 1, null],
    ['Complimentary visit', 'South', 0, 0, ''],
    ['Pending quote', 'South', null, 3, 'pending'],
    ['Materials recharge', 'North', 80, null, 'receipt'],
    ['Evening booking', 'South', 120, 2, ' '],
  ]
  const time = Date.parse('2027-04-01T09:00:00Z')
  const records = Object.fromEntries(
    rows.map((row, i) => {
      const id = 'entry-' + (i + 1)
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            ...Object.fromEntries(fields.map((field, col) => [field.id, row[col]])),
          },
          orderKey: String(i),
          createdAt: time,
          updatedAt: time,
        },
      ]
    }),
  )
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((f) => f.id)]
  const variants = [
    {
      id: 'totals',
      name: 'Totals and maximum',
      stats: { item: 'count', team: 'unique', amount: 'sum', units: 'max', memo: 'empty' },
    },
    {
      id: 'average',
      name: 'Average and minimum',
      stats: { item: 'count', team: 'unique', amount: 'average', units: 'min', memo: 'filled' },
    },
    {
      id: 'completeness',
      name: 'Filled and unique',
      stats: { item: 'count', team: 'unique', amount: 'unique', units: 'filled', memo: 'unique' },
    },
    {
      id: 'grouped',
      name: 'Grouped records, overall totals',
      stats: { item: 'count', team: 'unique', amount: 'sum', units: 'sum', memo: 'empty' },
    },
  ]
  return {
    id: 'column-summaries',
    name: 'Studio ledger summaries',
    schemaVersion: 1,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['ledger'],
    tables: {
      ledger: {
        id: 'ledger',
        name: 'Studio ledger',
        formulaName: 'StudioLedger',
        primaryFieldId: 'item',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((f) => [f.id, f])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        views: Object.fromEntries(
          variants.map((v) => [
            v.id,
            {
              id: v.id,
              name: v.name,
              tableId: 'ledger',
              type: BaseViewType.Grid,
              fieldOrder,
              fieldSettings: Object.fromEntries(
                fieldOrder.map((id) => [
                  id,
                  { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'item' ? 250 : 175 },
                ]),
              ),
              filter: null,
              sort: [],
              group: (v.id === 'grouped'
                ? [{ fieldId: 'team', direction: BaseSortDirection.ASC }]
                : []) as IGroupConfig[],
              config: { frozenFieldCount: 1, rowHeight: 'short', showRecordIndex: true, fieldStats: v.stats },
            },
          ]),
        ),
        viewOrder: variants.map((v) => v.id),
      },
    },
  }
}
