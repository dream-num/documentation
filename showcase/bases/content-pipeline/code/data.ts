import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type IViewSnapshot,
} from '@univerjs/core'

export const CONTENT_ITEMS = [
  ['Pricing launch page', 'In review', 'Amina Yusuf', 'Web', 82, 1788134400000],
  ['Migration playbook', 'Drafting', 'Jon Bell', 'Docs', 64, 1788307200000],
  ['Partner webinar', 'Scheduled', 'Sofia Park', 'Event', 91, 1788566400000],
  ['Security FAQ', 'Blocked', 'Noah Martin', 'Docs', 45, 1788739200000],
  ['Customer story: Aeris', 'Approved', 'Priya Shah', 'Video', 100, 1788998400000],
  ['Regional email sequence', 'Drafting', 'Elena Rossi', 'Email', 58, 1789171200000],
  ['Launch teaser: product tour', 'Planned', 'Maya Chen', 'Video', 0, 1788220800000],
  ['APAC release translation', 'In review', 'Elena Rossi', 'Web', 76, 1788825600000],
  ['Founder interview notes', 'Drafting', 'Jon Bell', 'Docs', 32, null],
  ['Accessibility checklist', 'Blocked', 'Amina Yusuf', 'Docs', 67, 1789344000000],
  ['Launch retrospective', 'Planned', 'Sofia Park', 'Slides', 12, 1790812800000],
  ['Partner follow-up email', 'Approved', 'Priya Shah', 'Email', 100, 1788566400000],
] as const

export const EXTRA_ITEM = ['Analyst briefing deck', 'Planned', 'Maya Chen', 'Slides', 20, 1789516800000] as const

const timestamp = 1788220800000
const options = (names: string[], colors: string[]) => ({
  options: names.map((name, index) => ({ id: name, name, color: colors[index % colors.length] })),
})
const fields: IFieldSnapshot[] = [
  { id: 'asset', name: 'Asset', type: BaseFieldType.Text, config: {} },
  {
    id: 'status',
    name: 'Status',
    type: BaseFieldType.SingleSelect,
    config: options(
      ['Planned', 'Drafting', 'In review', 'Scheduled', 'Approved', 'Blocked'],
      ['gray', 'blue', 'yellow', 'purple', 'green', 'red'],
    ),
  },
  { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
  {
    id: 'channel',
    name: 'Channel',
    type: BaseFieldType.SingleSelect,
    config: options(
      ['Web', 'Docs', 'Event', 'Video', 'Email', 'Slides'],
      ['blue', 'cyan', 'purple', 'pink', 'orange', 'green'],
    ),
  },
  { id: 'progress', name: 'Progress', type: BaseFieldType.Progress, config: {} },
  {
    id: 'publishDate',
    name: 'Publish date',
    type: BaseFieldType.Date,
    config: { pattern: 'yyyy/mm/dd', includeTime: false },
  },
]
const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
const records = Object.fromEntries(
  CONTENT_ITEMS.map((values, index) => {
    const id = 'r' + String(index + 1).padStart(2, '0')
    return [
      id,
      {
        id,
        values: {
          [BASE_RECORD_ID_FIELD_ID]: id,
          ...Object.fromEntries(fields.map((field, column) => [field.id, values[column]])),
        },
        orderKey: String(index).padStart(3, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]
  }),
)
const view = (id: string, name: string, type: BaseViewType, config: IViewSnapshot['config']): IViewSnapshot => ({
  id,
  tableId: 'content',
  name,
  type,
  fieldOrder: [...fieldOrder],
  fieldSettings: Object.fromEntries(
    fieldOrder.map((field) => [
      field,
      { hidden: field === BASE_RECORD_ID_FIELD_ID, width: field === 'asset' ? 290 : field === 'owner' ? 170 : 145 },
    ]),
  ),
  filter: null,
  sort: [],
  group: [],
  config,
})
export const DATA: IBaseSnapshot = {
  id: 'content-pipeline-base',
  name: 'Launch Content Pipeline',
  schemaVersion: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  tableOrder: ['content'],
  tables: {
    content: {
      id: 'content',
      name: 'Content calendar',
      formulaName: 'LaunchContent',
      primaryFieldId: 'asset',
      fields: {
        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
        ...Object.fromEntries(fields.map((field) => [field.id, field])),
      },
      fieldOrder,
      records,
      recordOrder: Object.keys(records),
      views: {
        grid: view('grid', 'Editorial grid', BaseViewType.Grid, {
          frozenFieldCount: 1,
          rowHeight: 'medium',
          showRecordIndex: true,
        }),
        board: view('board', 'Status board', BaseViewType.Kanban, {
          groupFieldId: 'status',
          cardLayout: 'compose',
          showFieldNames: true,
        }),
        calendar: view('calendar', 'Publishing calendar', BaseViewType.Calendar, {
          startDateFieldId: 'publishDate',
          titleFieldId: 'asset',
          colorFieldId: 'status',
          mode: 'month',
          timeZone: 'UTC',
        }),
      },
      viewOrder: ['grid', 'board', 'calendar'],
    },
  },
}
