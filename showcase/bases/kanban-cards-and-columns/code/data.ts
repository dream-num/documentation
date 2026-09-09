import type { IBaseSnapshot, IFieldSnapshot, IKanbanViewConfig, IViewSnapshot } from '@univerjs/core'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

// Original fictional instrument-repair jobs. No external assets or personal information.
const JOBS = [
  ['Replace violin bridge', 'Violin', 'intake', 2.5, 'Inspect the top plate before fitting.'],
  ['Reseat flute pads', 'Flute', 'intake', 3, 'Leak test requested after assembly.'],
  ['Regulate piano action', 'Piano', 'bench', 6, 'Keep the current touch weight.'],
  ['Repair cello seam', 'Cello', 'bench', 2, 'Use reversible hide glue.'],
  ['Clean trumpet valves', 'Trumpet', 'review', 1.5, 'Check valve alignment and slide travel.'],
  ['Balance clarinet springs', 'Clarinet', 'review', 2.25, 'Player prefers a lighter upper joint.'],
] as const

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 3, 3, 12)
  const fields: IFieldSnapshot[] = [
    { id: 'job', name: 'Repair job', type: BaseFieldType.Text, config: {} },
    { id: 'instrument', name: 'Instrument', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'intake', name: 'Intake', color: '#D89D65' },
          { id: 'bench', name: 'On bench', color: '#176B73' },
          { id: 'review', name: 'Play test', color: '#8D78A8' },
          { id: 'ready', name: 'Ready for collection', color: '#6E9778' },
        ],
      },
    },
    { id: 'hours', name: 'Bench hours', type: BaseFieldType.Number, config: { decimalPlaces: 2 } },
    { id: 'note', name: 'Repair note', type: BaseFieldType.Text, config: {} },
    { id: 'cover', name: 'Instrument cover', type: BaseFieldType.Attachment, config: {} },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
  const records = Object.fromEntries(
    JOBS.map(([job, instrument, status, hours, note], index) => {
      const id = `job-${index + 1}`
      const drawing =
        index === 0
          ? '<rect width="360" height="180" fill="#F3DDC3"/><path d="M180 30V110M170 25H190M158 74C118 50 122 121 150 132C180 161 211 132 218 108C224 81 203 58 190 76" fill="#AD663D" stroke="#633B27" stroke-width="8"/><path d="M175 35V125M185 35V125" stroke="#F9ECD9" stroke-width="2"/>'
          : index === 2
            ? '<rect width="360" height="180" fill="#C5DFDC"/><path d="M75 45H285V135H75Z" fill="#203E42"/><path d="M85 85H275V125H85Z" fill="#FAF4E8"/><path d="M110 85V125M135 85V125M160 85V125M185 85V125M210 85V125M235 85V125M260 85V125" stroke="#203E42" stroke-width="3"/><path d="M102 85V107M127 85V107M177 85V107M202 85V107M227 85V107" stroke="#203E42" stroke-width="10"/>'
            : null
      const source = drawing
        ? 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="180" viewBox="0 0 360 180">' +
              drawing +
              '</svg>',
          )
        : null
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            job,
            instrument,
            status,
            hours,
            note,
            cover: source
              ? [
                  {
                    id: id + '-cover',
                    name: instrument.toLowerCase() + '.svg',
                    mimeType: 'image/svg+xml',
                    sourceType: 'BASE64',
                    source,
                    thumbnail: source,
                    width: 360,
                    height: 180,
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
  const common = {
    tableId: 'jobs',
    fieldOrder: [...fieldOrder],
    fieldSettings: Object.fromEntries(
      fieldOrder.map((id) => [
        id,
        { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'job' ? 260 : id === 'note' ? 340 : 155 },
      ]),
    ),
    filter: null,
    sort: [],
    group: [],
  }
  const board = (id: string, name: string, config: Partial<IKanbanViewConfig>): IViewSnapshot => ({
    ...structuredClone(common),
    id,
    name,
    type: BaseViewType.Kanban,
    config: {
      groupFieldId: 'status',
      cardLayout: 'compose',
      showFieldNames: false,
      card: { titleFieldId: 'job', fieldIds: ['instrument', 'hours'] },
      fieldSettings: {
        instrument: { hidden: false, order: 0 },
        hours: { hidden: false, order: 1 },
        note: { hidden: true },
      },
      columnSettings: {},
      ...config,
    },
  })
  return {
    id: 'repair-kanban',
    name: 'Instrument workshop',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['jobs'],
    tables: {
      jobs: {
        id: 'jobs',
        name: 'Repair jobs',
        formulaName: 'InstrumentRepairs',
        primaryFieldId: 'job',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['compact', 'detailed', 'covers', 'source'],
        views: {
          compact: board('compact', 'Compact cards', {}),
          detailed: board('detailed', 'Labeled repair cards', {
            cardLayout: 'normal',
            showFieldNames: true,
            card: { titleFieldId: 'job', fieldIds: ['instrument', 'hours', 'note'] },
            fieldSettings: {
              instrument: { hidden: false, order: 0 },
              hours: { hidden: false, order: 1 },
              note: { hidden: false, order: 2 },
            },
          }),
          covers: board('covers', 'Cover cards', {
            cardLayout: 'normal',
            coverFieldId: 'cover',
            card: { titleFieldId: 'job', coverFieldId: 'cover', fieldIds: ['instrument', 'hours'] },
          }),
          source: {
            ...structuredClone(common),
            id: 'source',
            name: 'Source records',
            type: BaseViewType.Grid,
            config: { frozenFieldCount: 1, rowHeight: 'medium', showRecordIndex: true },
          },
        },
      },
    },
  }
}
