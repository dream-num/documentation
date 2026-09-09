import type { IBaseSnapshot, ICalendarViewConfig, IFieldSnapshot, IViewSnapshot } from '@univerjs/core'
import { dateToExcelSerial } from '@univerjs-pro/bases'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export const APPOINTMENTS = [
  ['Lamp diagnosis', 'Repair', 'Workshop A', [8, 9, 0], [8, 10, 30], 'Bring the original plug and cable.'],
  ['Chair joint review', 'Consultation', 'Bench 2', [8, 10, 0], [8, 11, 0], 'Compare two reversible joint repairs.'],
  ['Textile patch lesson', 'Workshop', 'Studio', [8, 14, 0], [8, 16, 0], 'Six places; offcuts supplied.'],
  ['Tool induction', 'Workshop', 'Workshop A', [9, 9, 30], [9, 10, 30], 'A short supervised safety session.'],
  [
    'Glaze curing window',
    'Repair',
    'Drying shelf',
    [7, 15, 0],
    [9, 10, 0],
    'Multi-day interval; no customer attendance.',
  ],
  ['Weekend repair clinic', 'Workshop', 'Studio', [12, 10, 0], [12, 13, 0], 'Three hours of shared bench time.'],
  [
    'Radio assessment request',
    'Consultation',
    'Awaiting allocation',
    null,
    null,
    'Undated request remains visible in Source grid.',
  ],
] as const

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2026, 8, 1)
  const fields: IFieldSnapshot[] = [
    { id: 'appointment', name: 'Appointment', type: BaseFieldType.Text, config: {} },
    {
      id: 'kind',
      name: 'Session type',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          ['Repair', 'blue'],
          ['Consultation', 'orange'],
          ['Workshop', 'green'],
        ].map(([name, color]) => ({ id: name, name, color })),
      },
    },
    ...[
      ['start', 'Starts'],
      ['end', 'Ends'],
    ].map(([id, name]) => ({
      id,
      name,
      type: BaseFieldType.Date,
      config: { pattern: 'yyyy/mm/dd', includeTime: true, hourCycle: 'h24' },
    })),
    { id: 'room', name: 'Location', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Preparation note', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const records = Object.fromEntries(
    APPOINTMENTS.map(([appointment, kind, room, start, end, note], index) => {
      const id = 'appointment-' + (index + 1)
      return [
        id,
        {
          id,
          orderKey: String(index).padStart(4, '0'),
          createdAt: timestamp,
          updatedAt: timestamp,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            appointment,
            kind,
            room,
            note,
            // Preserve authored local wall-clock components with the SDK's public conversion.
            start: start ? dateToExcelSerial(new Date(2026, 8, start[0], start[1], start[2])) : null,
            end: end ? dateToExcelSerial(new Date(2026, 8, end[0], end[1], end[2])) : null,
          },
        },
      ]
    }),
  )
  const views: Record<string, IViewSnapshot> = {}
  for (const mode of ['month', 'week', 'day'] as const) {
    const config: ICalendarViewConfig = {
      startDateFieldId: 'start',
      endDateFieldId: 'end',
      titleFieldId: 'appointment',
      colorFieldId: 'kind',
      mode,
      timeZone: 'local',
      timeslotSize: mode === 'day' ? 'short' : 'medium',
      displayColor: mode === 'day' ? { type: 'custom', color: '#2563eb' } : { type: 'selectField', fieldId: 'kind' },
      fieldSettings: {
        kind: { hidden: false, order: 0 },
        room: { hidden: false, order: 1 },
        note: { hidden: mode !== 'day', order: 2 },
      },
    }
    views[mode] = {
      id: mode,
      tableId: 'appointments',
      name: mode[0].toUpperCase() + mode.slice(1) + ' schedule',
      type: BaseViewType.Calendar,
      config,
    }
  }
  views.grid = {
    id: 'grid',
    tableId: 'appointments',
    name: 'Source grid',
    type: BaseViewType.Grid,
    fieldOrder: [...fieldOrder],
    fieldSettings: Object.fromEntries(
      fieldOrder.map((id) => [
        id,
        {
          hidden: id === BASE_RECORD_ID_FIELD_ID,
          width: id === 'appointment' ? 230 : id === 'note' ? 340 : id === 'start' || id === 'end' ? 205 : 180,
        },
      ]),
    ),
    filter: null,
    sort: [],
    group: [],
    config: { rowHeight: 'medium', frozenFieldCount: 1, showRecordIndex: true },
  }
  return {
    id: 'repair-studio-calendar',
    name: 'Repair studio appointments',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['appointments'],
    tables: {
      appointments: {
        id: 'appointments',
        name: 'Appointments',
        formulaName: 'RepairAppointments',
        primaryFieldId: 'appointment',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['month', 'week', 'day', 'grid'],
        views,
      },
    },
  }
}
