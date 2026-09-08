import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2026, 8, 9)
  const fields: IFieldSnapshot[] = [
    { id: 'studio', name: 'Studio', type: BaseFieldType.Text, config: {} },
    { id: 'website', name: 'Website', type: BaseFieldType.Link, config: {} },
    { id: 'email', name: 'Email', type: BaseFieldType.Email, config: {} },
    { id: 'phone', name: 'Phone', type: BaseFieldType.Phone, config: {} },
    { id: 'note', name: 'Contact note', type: BaseFieldType.Text, config: {} },
  ]
  const rows: BaseCellValue[][] = [
    [
      'Paper Harbor',
      { text: 'Workshop catalog', url: 'https://example.com/paper' },
      'hello@example.com',
      '+1 (202) 555-0101',
      'Labeled website; shared inbox',
    ],
    [
      'Moss Letterpress',
      'https://example.com/moss',
      'proofs@example.com',
      '+1 (202) 555-0102',
      'Bare URL; proof requests',
    ],
    [
      'Blue Kiln',
      { text: 'Open studio dates', url: 'https://example.com/kiln?view=events' },
      null,
      '+1 (202) 555-0103',
      'Email not provided',
    ],
    ['Copper Loom', null, 'weave@example.com', null, 'Email only; no website or phone'],
    ['Quiet Bindery', null, null, null, 'New contact; details pending'],
    [
      'Ochre Press',
      { text: 'Print archive', url: 'https://example.com/ochre#archive' },
      'archive@example.com',
      '+1 (202) 555-0106',
      'All entries are fictional',
    ],
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const records = Object.fromEntries(
    rows.map((row, index) => {
      const id = 'contact-' + (index + 1)
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
    id: 'contact-link-fields',
    name: 'Studio contacts · fictional directory',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['contacts'],
    tables: {
      contacts: {
        id: 'contacts',
        name: 'Studio contacts',
        formulaName: 'StudioContacts',
        primaryFieldId: 'studio',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['directory'],
        views: {
          directory: {
            id: 'directory',
            tableId: 'contacts',
            name: 'Links and contact details',
            type: BaseViewType.Grid,
            fieldOrder: [...fieldOrder],
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width:
                    id === 'studio' ? 175 : id === 'website' ? 235 : id === 'email' ? 210 : id === 'phone' ? 195 : 250,
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
