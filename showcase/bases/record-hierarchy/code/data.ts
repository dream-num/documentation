import type { IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export const PARENTS = [
  ['research', 'exhibition'],
  ['interviews', 'research'],
  ['archive', 'research'],
  ['installation', 'exhibition'],
  ['lighting', 'installation'],
  ['labels', 'installation'],
  ['audio', 'accessibility'],
] as const

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2026, 8, 1)
  const rows = [
    ['exhibition', 'Tidal Memory exhibition', 'Mara', 48],
    ['research', 'Research and stories', 'Jun', 18],
    ['interviews', 'Record dockworker interviews', 'Inez', 8],
    ['archive', 'Select archival photographs', 'Jun', 6],
    ['installation', 'Gallery installation', 'Omar', 22],
    ['lighting', 'Tune low-glare lighting', 'Omar', 7],
    ['labels', 'Print bilingual labels', 'Nia', 4],
    ['accessibility', 'Visitor access programme', 'Sal', 12],
    ['audio', 'Record audio descriptions', 'Inez', 5],
    ['review', 'Independent safety review', 'Eli', 3],
  ] as const
  const fields: IFieldSnapshot[] = [
    { id: 'task', name: 'Work item', type: BaseFieldType.Text, config: {} },
    { id: 'owner', name: 'Coordinator', type: BaseFieldType.Text, config: {} },
    { id: 'hours', name: 'Planned hours', type: BaseFieldType.Number, config: { precision: 0 } },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((f) => f.id)]
  const records = Object.fromEntries(
    rows.map(([id, task, owner, hours], index) => [
      id,
      {
        id,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, task, owner, hours },
        orderKey: String(index).padStart(4, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]),
  )
  return {
    id: 'exhibition-hierarchy',
    name: 'Tidal Memory / record hierarchy',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['tasks'],
    tables: {
      tasks: {
        id: 'tasks',
        name: 'Exhibition work',
        formulaName: 'ExhibitionWork',
        primaryFieldId: 'task',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((f) => [f.id, f])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['tree'],
        views: {
          tree: {
            id: 'tree',
            tableId: 'tasks',
            name: 'Parent and child records',
            type: BaseViewType.Grid,
            fieldOrder: [...fieldOrder],
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'task' ? 430 : 180 },
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
