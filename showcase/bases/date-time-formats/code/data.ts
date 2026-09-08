import type { IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import { dateToExcelSerial } from '@univerjs-pro/bases'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

export const FORMATS = {
  iso: { pattern: 'yyyy-mm-dd', includeTime: false, hourCycle: 'h24' },
  dayFirst: { pattern: 'dd/mm/yyyy', includeTime: false, hourCycle: 'h24' },
  clock24: { pattern: 'yyyy/mm/dd', includeTime: true, hourCycle: 'h24' },
  clock12: { pattern: 'yyyy/mm/dd', includeTime: true, hourCycle: 'h12' },
} as const

// Author local calendar components and use the installed SDK's date conversion.
// beta.2 renders its serials in the browser timezone. Do not treat a UTC serial as local time.
export const APPOINTMENTS = [
  ['Morning fitting', [2028, 1, 29, 9, 30]],
  ['Afternoon portrait', [2028, 1, 29, 14, 15]],
  ['Midnight light test', [2028, 2, 1, 0, 0]],
  ['Leap-day review', [2028, 1, 29, 18, 0]],
  ['New-year setup', [2029, 0, 1, 0, 15]],
  ['Awaiting confirmation', null],
] as const

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 1, 29, 0, 0)
  const labels = ['ISO date', 'Day first', '24-hour', '12-hour']
  const fields: IFieldSnapshot[] = [
    { id: 'appointment', name: 'Appointment', type: BaseFieldType.Text, config: {} },
    ...Object.entries(FORMATS).map(([id, config], index) => ({
      id,
      name: labels[index],
      type: BaseFieldType.Date,
      config: { ...config },
    })),
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
  const records = Object.fromEntries(
    APPOINTMENTS.map(([name, parts], index) => {
      const serial =
        parts === null ? null : dateToExcelSerial(new Date(parts[0], parts[1], parts[2], parts[3], parts[4]))
      const id = `appointment-${index + 1}`
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            appointment: name,
            ...Object.fromEntries(Object.keys(FORMATS).map((key) => [key, serial])),
          },
          orderKey: String(index).padStart(4, '0'),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]
    }),
  )
  return {
    id: 'studio-date-formats',
    name: 'Studio appointments · date formats',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['appointments'],
    tables: {
      appointments: {
        id: 'appointments',
        name: 'Appointments',
        formulaName: 'StudioAppointments',
        primaryFieldId: 'appointment',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['comparison'],
        views: {
          comparison: {
            id: 'comparison',
            tableId: 'appointments',
            name: 'Four date formats',
            type: BaseViewType.Grid,
            fieldOrder: [...fieldOrder],
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'appointment' ? 230 : id.startsWith('clock') ? 205 : id === 'iso' ? 185 : 145,
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
