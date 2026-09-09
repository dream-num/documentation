import type { IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { serializeRecordLinkIds } from '@univerjs-pro/bases'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 3, 12)
  const equipmentFields: IFieldSnapshot[] = [
    { id: 'name', name: 'Equipment', type: BaseFieldType.Text, config: {} },
    { id: 'model', name: 'Model', type: BaseFieldType.Text, config: {} },
    { id: 'location', name: 'Storage', type: BaseFieldType.Text, config: {} },
    { id: 'cost', name: 'Cost', type: BaseFieldType.Number, config: { decimalPlaces: 2 } },
  ]
  const requestFields: IFieldSnapshot[] = [
    { id: 'name', name: 'Field request', type: BaseFieldType.Text, config: {} },
    {
      id: 'primary',
      name: 'Primary equipment',
      type: BaseFieldType.RecordLink,
      config: {
        targetTableId: 'equipment',
        multiple: false,
        displayFieldId: 'name',
        pickerFieldIds: ['model', 'location'],
      },
    },
    {
      id: 'extras',
      name: 'Additional equipment',
      type: BaseFieldType.RecordLink,
      config: {
        targetTableId: 'equipment',
        multiple: true,
        displayFieldId: 'name',
        pickerFieldIds: ['model', 'location'],
      },
    },
  ]
  requestFields.push(
    {
      id: 'storage',
      name: 'Storage lookup',
      type: BaseFieldType.Formula,
      config: { formula: '=XLOOKUP([Primary equipment],EquipmentInventory[record-id],EquipmentInventory[Storage],"")' },
    },
    {
      id: 'total',
      name: 'Additional cost',
      type: BaseFieldType.Formula,
      config: {
        formula:
          '=IF([Additional equipment]="",0,SUM(XLOOKUP(TEXTSPLIT([Additional equipment],","),EquipmentInventory[record-id],EquipmentInventory[Cost],0)))',
        numfmt: { type: 'number', pattern: '0.00' },
      },
    },
  )
  const equipment = [
    ['recorder-north', 'Field recorder', 'R-12 stereo', 'North cupboard'],
    ['recorder-south', 'Field recorder', 'R-24 directional', 'South cupboard'],
    ['lens', 'Hand lens', '10× folding', 'Drawer 3'],
    ['meter', 'Light meter', 'LM-4', 'Blue case'],
    ['tripod', 'Travel tripod', 'T-2 compact', 'Equipment rack'],
  ].map(([id, name, model, location], index) => ({
    id,
    values: { name, model, location, cost: [90, 140, 15, 35, 25][index] },
  }))
  const requests = [
    ['dawn', 'Dawn bird survey', ['recorder-north'], ['tripod']],
    ['pond', 'Pond insect count', ['lens'], ['meter', 'tripod']],
    ['night', 'Night sound walk', ['recorder-south'], []],
    ['canopy', 'Canopy light study', ['meter'], ['lens']],
    ['training', 'Volunteer training', [], []],
    ['stream', 'Stream bank mapping', ['tripod'], ['lens', 'meter']],
  ] as const
  const tables: Record<string, ITableSnapshot> = {}
  for (const [id, name, fields, rows] of [
    [
      'requests',
      'Requests',
      requestFields,
      requests.map(([recordId, label, primary, extras]) => ({
        id: recordId,
        values: { name: label, primary: serializeRecordLinkIds(primary), extras: serializeRecordLinkIds(extras) },
      })),
    ],
    ['equipment', 'Equipment', equipmentFields, equipment],
  ] as const) {
    const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
    tables[id] = {
      id,
      name,
      formulaName: id === 'requests' ? 'EquipmentRequests' : 'EquipmentInventory',
      primaryFieldId: 'name',
      fields: {
        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
        ...Object.fromEntries(fields.map((field) => [field.id, field])),
      },
      fieldOrder,
      records: Object.fromEntries(
        rows.map((record, index) => [
          record.id,
          {
            ...record,
            values: { ...record.values, [BASE_RECORD_ID_FIELD_ID]: record.id },
            orderKey: String(index).padStart(4, '0'),
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]),
      ),
      recordOrder: rows.map((record) => record.id),
      viewOrder: [`${id}-grid`],
      views: {
        [`${id}-grid`]: {
          id: `${id}-grid`,
          tableId: id,
          name: id === 'requests' ? 'Linked calculations' : 'Source equipment',
          type: BaseViewType.Grid,
          fieldOrder: [...fieldOrder],
          fieldSettings: Object.fromEntries(
            fieldOrder.map((fieldId) => [
              fieldId,
              {
                hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
                width: fieldId === 'name' ? 205 : fieldId === 'extras' ? 255 : fieldId === 'total' ? 180 : 190,
              },
            ]),
          ),
          filter: null,
          sort: [],
          group: [],
          config: { rowHeight: 'medium', frozenFieldCount: 1, showRecordIndex: true },
        },
      },
    }
  }
  return {
    id: 'equipment-linked-calculations',
    name: 'Field equipment · linked calculations',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['requests', 'equipment'],
    tables,
  }
}
