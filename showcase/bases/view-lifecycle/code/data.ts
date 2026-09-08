import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type IViewSnapshot,
} from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const fields: IFieldSnapshot[] = [
    { id: 'item', name: 'Library item', type: BaseFieldType.Text, config: {} },
    { id: 'station', name: 'Repair station', type: BaseFieldType.Text, config: {} },
    { id: 'parts', name: 'Spare parts', type: BaseFieldType.Number, config: { decimalPlaces: 0 } },
    { id: 'note', name: 'Handover note', type: BaseFieldType.Text, config: {} },
  ]
  const rows = [
    ['Brass desk lamp', 'Electrical', 2, 'Replace cord; retain original shade.'],
    ['Board field bag', 'Textiles', 1, 'Stitch handle and return spare buckle.'],
    ['Beech reading stool', 'Woodwork', 4, 'Tighten legs; keep felt pads.'],
    ['Hand-crank radio', 'Electrical', 0, 'Clean contacts before replacing parts.'],
    ['Garden tool roll', 'Textiles', 3, 'Label pockets for shared tools.'],
    ['Map drawer tray', 'Woodwork', 2, 'Sand runners; preserve index label.'],
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
  const timestamp = 1806537600000
  const records = Object.fromEntries(
    rows.map((row, index) => {
      const id = `item-${index + 1}`
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            ...Object.fromEntries(fields.map((field, column) => [field.id, row[column]])),
          },
          orderKey: String(index).padStart(3, '0'),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]
    }),
  )
  const views: IViewSnapshot[] = [
    ['all', 'All items', false],
    ['dispatch', 'Dispatch projection', true],
    ['scratch', 'Scratch copy', true],
  ].map(([id, name, compact]) => ({
    id: String(id),
    tableId: 'items',
    name: String(name),
    type: BaseViewType.Grid,
    fieldOrder: [...fieldOrder],
    fieldSettings: Object.fromEntries(
      fieldOrder.map((field) => [
        field,
        {
          hidden: field === BASE_RECORD_ID_FIELD_ID || (Boolean(compact) && field === 'note'),
          width: field === 'item' ? 270 : field === 'note' ? 380 : 170,
        },
      ]),
    ),
    filter: null,
    sort: [],
    group: [],
    config: { frozenFieldCount: 1, rowHeight: compact ? 'short' : 'tall', showRecordIndex: true },
  }))
  return {
    id: 'repair-view-lifecycle',
    name: 'Borrow Again / view lifecycle',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['items'],
    tables: {
      items: {
        id: 'items',
        name: 'Repair library',
        formulaName: 'RepairItems',
        primaryFieldId: 'item',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: views.map((view) => view.id),
        views: Object.fromEntries(views.map((view) => [view.id, view])),
      },
    },
  }
}
