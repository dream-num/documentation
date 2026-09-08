import type { IBaseSnapshot, IFieldSnapshot, IGanttViewConfig, IViewSnapshot } from '@univerjs/core'
import { dateToExcelSerial } from '@univerjs-pro/bases'
import { BASE_RECORD_ID_FIELD_ID, BaseFieldType, BaseViewType, createBaseRecordIdField } from '@univerjs/core'

// Original fictional exhibition-installation data. Dates are authored locally at noon.
const TASKS = [
  ['Survey the gallery', 4, 5, 100, 'planning'],
  ['Approve display drawings', 5, 8, 100, 'planning'],
  ['Build modular plinths', 7, 14, 65, 'fabrication'],
  ['Print interpretive panels', 11, 15, 40, 'fabrication'],
  ['Install lighting tracks', 13, 18, 25, 'installation'],
  ['Position loan objects', 18, 21, 0, 'installation'],
  ['Tune light and captions', 20, 22, 0, 'review'],
  ['Visitor access walk-through', 25, 25, 0, 'review'],
] as const

export function createData(): IBaseSnapshot {
  const stamp = Date.UTC(2028, 8, 4, 12)
  const fields: IFieldSnapshot[] = [
    { id: 'task', name: 'Installation task', type: BaseFieldType.Text, config: {} },
    { id: 'start', name: 'Start', type: BaseFieldType.Date, config: { pattern: 'yyyy-mm-dd', includeTime: false } },
    { id: 'end', name: 'Finish', type: BaseFieldType.Date, config: { pattern: 'yyyy-mm-dd', includeTime: false } },
    { id: 'progress', name: 'Progress', type: BaseFieldType.Progress, config: { start: 0, end: 100 } },
    {
      id: 'phase',
      name: 'Phase',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'planning', name: 'Planning', color: '#176B73' },
          { id: 'fabrication', name: 'Fabrication', color: '#D89D65' },
          { id: 'installation', name: 'Installation', color: '#657DAD' },
          { id: 'review', name: 'Review', color: '#9C7899' },
        ],
      },
    },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
  const records = Object.fromEntries(
    TASKS.map(([task, start, end, progress, phase], index) => {
      const id = `task-${index + 1}`
      return [
        id,
        {
          id,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            task,
            start: dateToExcelSerial(new Date(2028, 8, start, 12)),
            end: dateToExcelSerial(new Date(2028, 8, end, 12)),
            progress,
            phase,
          },
          orderKey: String(index).padStart(4, '0'),
          createdAt: stamp,
          updatedAt: stamp,
        },
      ]
    }),
  )
  const gantt = (id: string, name: string, config: Partial<IGanttViewConfig>): IViewSnapshot => ({
    id,
    tableId: 'installation',
    name,
    type: BaseViewType.Gantt,
    fieldOrder: [...fieldOrder],
    fieldSettings: Object.fromEntries(
      fieldOrder.map((field) => [
        field,
        { hidden: !['task', 'progress'].includes(field), width: field === 'task' ? 240 : 100 },
      ]),
    ),
    filter: null,
    sort: [],
    group: [],
    config: {
      startDateFieldId: 'start',
      endDateFieldId: 'end',
      titleFieldId: 'task',
      progressFieldId: 'progress',
      scale: 'quarter',
      leftPaneWidth: 360,
      leftPaneCollapsed: false,
      showTodayLine: false,
      showWeekend: true,
      displayColor: { type: 'selectField', fieldId: 'phase' },
      fieldSettings: {
        task: { hidden: false, order: 0 },
        progress: { hidden: false, order: 1 },
        start: { hidden: true },
        end: { hidden: true },
        phase: { hidden: true },
      },
      ...config,
    },
  })
  const grid: IViewSnapshot = {
    id: 'source',
    tableId: 'installation',
    name: 'Source records',
    type: BaseViewType.Grid,
    fieldOrder,
    fieldSettings: Object.fromEntries(
      fieldOrder.map((field) => [
        field,
        { hidden: field === BASE_RECORD_ID_FIELD_ID, width: field === 'task' ? 280 : 155 },
      ]),
    ),
    filter: null,
    sort: [],
    group: [],
    config: { rowHeight: 'medium', frozenFieldCount: 1, showRecordIndex: true },
  }
  return {
    id: 'exhibition-gantt',
    name: 'Exhibition installation',
    schemaVersion: 1,
    createdAt: stamp,
    updatedAt: stamp,
    tableOrder: ['installation'],
    tables: {
      installation: {
        id: 'installation',
        name: 'Installation tasks',
        formulaName: 'ExhibitionInstallation',
        primaryFieldId: 'task',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['overview', 'working-week', 'source'],
        views: {
          overview: gantt('overview', 'Quarter overview', {}),
          'working-week': gantt('working-week', 'Working week', {
            scale: 'week',
            workingDaysOnly: true,
            workingDays: { weekdays: [1, 2, 3, 4, 5], exceptions: [] },
          }),
          source: grid,
        },
      },
    },
  }
}
