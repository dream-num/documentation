import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2026, 8, 9)
  const fields: IFieldSnapshot[] = [
    { id: 'sample', name: 'Print sample', type: BaseFieldType.Text, config: {} },
    { id: 'approved', name: 'Approved', type: BaseFieldType.Checkbox, config: { icon: 'check' } },
    { id: 'followup', name: 'Follow up', type: BaseFieldType.Checkbox, config: { icon: 'flag' } },
    { id: 'craft', name: 'Craft / 5', type: BaseFieldType.Rating, config: { min: 0, max: 5, icon: 'star' } },
    { id: 'appeal', name: 'Appeal / 3', type: BaseFieldType.Rating, config: { min: 0, max: 3, icon: 'heart' } },
    { id: 'note', name: 'Review note', type: BaseFieldType.Text, config: {} },
  ]
  const rows: BaseCellValue[][] = [
    ['Cobalt tide', true, false, 5, 3, 'Ready for the studio wall'],
    ['Fern shadow', false, true, 2, 1, 'Revisit the registration'],
    ['Ochre pathway', true, true, 4, 2, 'Approved; request a larger proof'],
    ['Silver rain', false, false, 0, 0, 'Reviewed; no score awarded'],
    ['Rose window', null, null, null, null, 'Not reviewed yet'],
    ['Night garden', false, true, 1, 3, 'Strong idea; rough execution'],
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const records = Object.fromEntries(
    rows.map((row, index) => {
      const id = 'sample-' + (index + 1)
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            ...Object.fromEntries(fields.map((field, col) => [field.id, row[col]])),
          },
          orderKey: String(index).padStart(4, '0'),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]
    }),
  )
  return {
    id: 'print-review-fields',
    name: 'Print review · checks and ratings',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['samples'],
    tables: {
      samples: {
        id: 'samples',
        name: 'Print samples',
        formulaName: 'PrintSamples',
        primaryFieldId: 'sample',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['review'],
        views: {
          review: {
            id: 'review',
            tableId: 'samples',
            name: 'Checks and ratings',
            type: BaseViewType.Grid,
            fieldOrder: [...fieldOrder],
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width:
                    id === 'sample' ? 195 : id === 'note' ? 255 : id === 'craft' ? 170 : id === 'appeal' ? 145 : 125,
                },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', frozenFieldCount: 1, showRecordIndex: true },
          },
        },
      },
    },
  }
}
