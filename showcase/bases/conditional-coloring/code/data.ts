import type { IBaseConditionalColorRule, IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseConditionalColorOperator,
  BaseConditionalColorTarget,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
} from '@univerjs/core'

export function createRules(): Record<string, IBaseConditionalColorRule[]> {
  const thresholds = [
    {
      id: 'critical',
      fieldId: 'risk',
      operator: BaseConditionalColorOperator.GREATER_THAN,
      operand: 80,
      color: '#F6D4CA',
    },
    {
      id: 'watch',
      fieldId: 'risk',
      operator: BaseConditionalColorOperator.GREATER_THAN,
      operand: 50,
      color: '#F8E8B8',
    },
  ]
  return {
    rows: thresholds.map((rule) => Object.assign({}, rule, { target: BaseConditionalColorTarget.ROW })),
    cells: thresholds.map((rule) => Object.assign({}, rule, { target: BaseConditionalColorTarget.CELL })),
    columns: [
      {
        id: 'route-column',
        fieldId: 'route',
        target: BaseConditionalColorTarget.COLUMN,
        operator: BaseConditionalColorOperator.IS,
        operand: 'Not a route',
        color: '#D5E8E9',
      },
    ],
  }
}

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2026, 8, 1)
  const rows = [
    ['kelp', 'Kelp culture samples', 'North pier', 'Mara', 92, 4],
    ['coral', 'Coral nursery fragments', 'Reef station', 'Jun', 68, 8],
    ['seagrass', 'Seagrass seed trays', 'East inlet', 'Inez', 34, 12],
    ['oyster', 'Oyster spat collectors', 'North pier', 'Omar', 81, 6],
    ['plankton', 'Plankton reference jars', 'Reef station', 'Nia', 50, 3],
    ['sediment', 'Sediment core tubes', 'East inlet', 'Sal', 0, 10],
    ['algae', 'Algae growth slides', 'North pier', 'Eli', 80, 5],
    ['water', 'Water chemistry bottles', 'Reef station', 'Mara', 51, 9],
  ] as const
  const fields: IFieldSnapshot[] = [
    { id: 'cargo', name: 'Research cargo', type: BaseFieldType.Text, config: {} },
    { id: 'route', name: 'Destination', type: BaseFieldType.Text, config: {} },
    { id: 'owner', name: 'Coordinator', type: BaseFieldType.Text, config: {} },
    { id: 'risk', name: 'Risk score', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'crates', name: 'Crates', type: BaseFieldType.Number, config: { precision: 0 } },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
  const records = Object.fromEntries(
    rows.map(([id, cargo, route, owner, risk, crates], index) => [
      id,
      {
        id,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, cargo, route, owner, risk, crates },
        orderKey: String(index).padStart(4, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]),
  )
  return {
    id: 'cold-chain-colors',
    name: 'Marine samples / conditional coloring',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['shipments'],
    tables: {
      shipments: {
        id: 'shipments',
        name: 'Research shipments',
        formulaName: 'ResearchShipments',
        primaryFieldId: 'cargo',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['rows', 'cells', 'columns'],
        views: Object.fromEntries(
          [
            ['rows', 'Row / risk bands'],
            ['cells', 'Cell / risk bands'],
            ['columns', 'Column / destination'],
          ].map(([id, name]) => [
            id,
            {
              id,
              name,
              tableId: 'shipments',
              type: BaseViewType.Grid,
              fieldOrder: [...fieldOrder],
              fieldSettings: Object.fromEntries(
                fieldOrder.map((fieldId) => [
                  fieldId,
                  {
                    hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
                    width: fieldId === 'cargo' ? 280 : fieldId === 'route' ? 180 : 140,
                  },
                ]),
              ),
              filter: null,
              sort: [],
              group: [],
              config: { rowHeight: 'medium', frozenFieldCount: 1, showRecordIndex: true },
            },
          ]),
        ),
      },
    },
  }
}
