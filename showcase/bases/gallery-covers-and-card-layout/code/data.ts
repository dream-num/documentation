import type { IBaseSnapshot, IFieldSnapshot, IGalleryViewConfig, IViewSnapshot } from '@univerjs/core'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export const BASE_ID = 'material-library'
export const TABLE_ID = 'materials'

// Original geometric swatches; no remote images or attachment service required.
const swatches = [
  [
    '#dcc9a7',
    '<path d="M0 30H360M0 60H360M0 90H360M0 120H360M0 150H360M0 180H360" stroke="#a88b66" stroke-width="5"/><path d="M30 0V220M90 0V220M150 0V220M210 0V220M270 0V220M330 0V220" stroke="#f3e8d3" stroke-width="12"/>',
  ],
  [
    '#9f5c41',
    '<path d="M0 60H360M0 140H360M80 0V60M240 0V60M160 60V140M80 140V220M240 140V220" stroke="#e8bea3" stroke-width="8"/>',
  ],
  [
    '#235f63',
    '<path d="M0 170L110 0H175L30 220H0ZM100 220L245 0H300L155 220ZM220 220L360 10V100L280 220Z" fill="#6eafb0" opacity=".65"/>',
  ],
  [
    '#dfd9d1',
    '<path d="M35 40l35-15 22 30-30 20ZM190 20l50 20-20 25ZM110 130l25-30 30 30-20 30ZM265 120l40-25 20 45-35 20ZM25 180l40-15 10 30Z" fill="#b46851"/><path d="M125 30l25 10-5 30-35-10ZM240 185l25-35 35 40Z" fill="#446764"/>',
  ],
  [
    '#bea37d',
    '<path d="M0 35Q90 0 180 35T360 35M0 75Q90 40 180 75T360 75M0 115Q90 80 180 115T360 115M0 155Q90 120 180 155T360 155M0 195Q90 160 180 195T360 195" fill="none" stroke="#715637" stroke-width="5"/>',
  ],
] as const

export const MATERIALS = [
  ['Oat linen', 'Textile', 'Woven', 'Curtain study', 'Soft open weave for filtered light.'],
  ['Clay tile', 'Ceramic', 'Matte', 'Entry wall', 'Warm fired surface with a sanded edge.'],
  ['Lagoon glass', 'Glass', 'Translucent', 'Room divider', 'Layered color for a light partition.'],
  ['Shell terrazzo', 'Composite', 'Polished', 'Counter sample', 'Reclaimed mineral chips in a pale binder.'],
  ['Ash veneer', 'Timber', 'Brushed', 'Cabinet front', 'Long grain with a low-sheen finish.'],
  ['Graphite felt', 'Textile', 'Dense', 'Acoustic lining', 'Cover pending; compare the native empty-cover state.'],
] as const

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 0, 10)
  const fields: IFieldSnapshot[] = [
    { id: 'material', name: 'Material', type: BaseFieldType.Text, config: {} },
    { id: 'cover', name: 'Sample cover', type: BaseFieldType.Attachment, config: {} },
    ...[
      ['family', 'Family'],
      ['finish', 'Finish'],
      ['use', 'Proposed use'],
      ['note', 'Sample note'],
    ].map(([id, name]) => ({
      id,
      name,
      type: BaseFieldType.Text,
      config: {},
    })),
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const records = Object.fromEntries(
    MATERIALS.map(([material, family, finish, use, note], index) => {
      const id = 'sample-' + (index + 1)
      const swatch = swatches[index]
      const source = swatch
        ? 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220" viewBox="0 0 360 220"><rect width="360" height="220" fill="' +
              swatch[0] +
              '"/>' +
              swatch[1] +
              '</svg>',
          )
        : null
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            material,
            family,
            finish,
            use,
            note,
            cover: source
              ? [
                  {
                    id: id + '-cover',
                    name: material.toLowerCase().replaceAll(' ', '-') + '.svg',
                    mimeType: 'image/svg+xml',
                    sourceType: 'BASE64',
                    source,
                    thumbnail: source,
                    width: 360,
                    height: 220,
                  },
                ]
              : [],
          },
          orderKey: String(index).padStart(4, '0'),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]
    }),
  )
  const views: Record<string, IViewSnapshot> = {}
  for (const size of ['small', 'medium', 'large'] as const) {
    const visible =
      size === 'small'
        ? ['family', 'finish']
        : size === 'medium'
          ? ['finish', 'family', 'use']
          : ['use', 'note', 'family', 'finish']
    const config: IGalleryViewConfig = {
      coverFieldId: 'cover',
      cardSize: size,
      cardLayout: size === 'small' ? 'compose' : 'normal',
      showFieldNames: size !== 'small',
      card: { titleFieldId: 'material', coverFieldId: 'cover', fieldIds: visible },
      fieldSettings: Object.fromEntries(
        fields.map(({ id }) => [id, { hidden: !visible.includes(id), order: visible.indexOf(id) }]),
      ),
    }
    views[size] = {
      id: size,
      tableId: TABLE_ID,
      name: size[0].toUpperCase() + size.slice(1) + ' cards',
      type: BaseViewType.Gallery,
      config,
    }
  }
  views.grid = {
    id: 'grid',
    tableId: TABLE_ID,
    name: 'Source grid',
    type: BaseViewType.Grid,
    fieldOrder: [...fieldOrder],
    fieldSettings: Object.fromEntries(
      fieldOrder.map((id) => [id, { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'note' ? 360 : 180 }]),
    ),
    filter: null,
    sort: [],
    group: [],
    config: { rowHeight: 'tall', frozenFieldCount: 1, showRecordIndex: true },
  }
  return {
    id: BASE_ID,
    name: 'Material sample library',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: [TABLE_ID],
    tables: {
      [TABLE_ID]: {
        id: TABLE_ID,
        name: 'Materials',
        formulaName: 'MaterialSamples',
        primaryFieldId: 'material',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['small', 'medium', 'large', 'grid'],
        views,
      },
    },
  }
}
