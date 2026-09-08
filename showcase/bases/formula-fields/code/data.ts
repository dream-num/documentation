import type { IBaseSnapshot, IFieldSnapshot, IViewSnapshot } from '@univerjs/core'
import { dateToExcelSerial } from '@univerjs-pro/bases'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 2, 1)
  const fields: IFieldSnapshot[] = [
    { id: 'item', name: 'Item', type: BaseFieldType.Text, config: {} },
    { id: 'units', name: 'Units', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'rate', name: 'Rate', type: BaseFieldType.Number, config: { precision: 2 } },
    { id: 'hours', name: 'Hours', type: BaseFieldType.Number, config: { precision: 1 } },
    { id: 'due', name: 'Due', type: BaseFieldType.Date, config: { pattern: 'yyyy-mm-dd', includeTime: false } },
    {
      id: 'cost',
      name: 'Batch cost',
      type: BaseFieldType.Formula,
      config: { formula: '=[@[Units]]*[@[Rate]]', numfmt: { type: 'number', pattern: '0.00' } },
    },
    {
      id: 'label',
      name: 'Batch label',
      type: BaseFieldType.Formula,
      config: { formula: '=[@[Item]]&" / "&IF([@[Units]]>0,"Ready","Review")' },
    },
    {
      id: 'days',
      name: 'Days after Mar 1',
      type: BaseFieldType.Formula,
      config: { formula: '=IF([@[Due]]="","",[@[Due]]-DATE(2028,3,1))' },
    },
    {
      id: 'status',
      name: 'Quantity check',
      type: BaseFieldType.Formula,
      config: { formula: '=IF([@[Units]]="","Missing quantity",IF([@[Units]]=0,"Not scheduled","Ready"))' },
    },
    { id: 'ratio', name: 'Units per hour', type: BaseFieldType.Formula, config: { formula: '=[@[Units]]/[@[Hours]]' } },
    {
      id: 'safe',
      name: 'Guarded ratio',
      type: BaseFieldType.Formula,
      config: { formula: '=IFERROR([@[Units]]/[@[Hours]],"Check hours")' },
    },
  ]
  const rows: Array<[string, string, number | null, number, number | null, number | null]> = [
    ['mug', 'Speckled mugs', 12, 8, 3, 3],
    ['vase', 'Reed vases', 5, 22, 0, 5],
    ['bowl', 'Shallow bowls', 0, 15, 2, 8],
    ['tile', 'Test tiles', null, 6, null, null],
    ['pitcher', 'Pouring pitchers', 8, 18, 4, 13],
    ['planter', 'Window planters', 3, 30, 1.5, 16],
  ]
  const records = Object.fromEntries(
    rows.map(([id, item, units, rate, hours, day], index) => [
      id,
      {
        id,
        values: {
          [BASE_RECORD_ID_FIELD_ID]: id,
          item,
          units,
          rate,
          hours,
          due: day === null ? null : dateToExcelSerial(new Date(Date.UTC(2028, 2, day))),
        },
        orderKey: String(index).padStart(4, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]),
  )
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const views: Record<string, IViewSnapshot> = {}
  for (const [id, name, visible] of [
    ['cost', 'Numeric cost', ['item', 'units', 'rate', 'cost', 'status']],
    ['labels', 'Text and dates', ['item', 'units', 'due', 'label', 'days']],
    ['errors', 'Empty and error', ['item', 'units', 'hours', 'ratio', 'safe', 'status']],
  ] as const) {
    views[id] = {
      id,
      tableId: 'batches',
      name,
      type: BaseViewType.Grid,
      fieldOrder: [...visible, ...fieldOrder.filter((fieldId) => !visible.some((key) => key === fieldId))],
      fieldSettings: Object.fromEntries(
        fieldOrder.map((fieldId) => [
          fieldId,
          {
            hidden: !visible.some((key) => key === fieldId),
            width:
              fieldId === 'item'
                ? 205
                : fieldId === 'label'
                  ? 265
                  : ['status', 'safe', 'days', 'ratio'].includes(fieldId)
                    ? 175
                    : 130,
          },
        ]),
      ),
      filter: null,
      sort: [],
      group: [],
      config: { rowHeight: 'tall', frozenFieldCount: 1, showRecordIndex: true },
    }
  }
  return {
    id: 'kiln-formula-fields',
    name: 'Kiln workshop calculations',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['batches'],
    tables: {
      batches: {
        id: 'batches',
        name: 'Kiln batches',
        formulaName: 'KilnBatches',
        primaryFieldId: 'item',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: rows.map(([id]) => id),
        views,
        viewOrder: ['cost', 'labels', 'errors'],
      },
    },
  }
}
