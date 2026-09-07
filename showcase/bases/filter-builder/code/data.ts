import {
  BASE_RECORD_ID_FIELD_ID,
  createBaseRecordIdField,
  BaseFilterConjunction,
  BaseFilterOperator,
  BaseFieldType,
  BaseViewType,
  type IBaseSnapshot,
  type IFieldSnapshot,
  type IFilterConfig,
} from '@univerjs/core'
// Original synthetic data authored for this demo. No third-party assets or live services.
// Distribution terms are determined by the repository owner.
const timestamp = 1806537600000
const fields: IFieldSnapshot[] = [
  { id: 'company', name: 'Company', type: BaseFieldType.Text, config: {} },
  {
    id: 'region',
    name: 'Region',
    type: BaseFieldType.SingleSelect,
    config: {
      options: [
        { id: 'EMEA', name: 'EMEA', color: 'blue' },
        { id: 'APAC', name: 'APAC', color: 'blue' },
        { id: 'AMER', name: 'AMER', color: 'blue' },
      ],
    },
  },
  { id: 'budget', name: 'Budget', type: BaseFieldType.Number, config: {} },
  {
    id: 'stage',
    name: 'Stage',
    type: BaseFieldType.SingleSelect,
    config: {
      options: [
        { id: 'Discovery', name: 'Discovery', color: 'purple' },
        { id: 'Qualified', name: 'Qualified', color: 'purple' },
        { id: 'Negotiation', name: 'Negotiation', color: 'purple' },
      ],
    },
  },
  { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
]
const rows = [
  ['Aster Instruments', 'EMEA', 120000, 'Qualified', 'Mina'],
  ['Bluefin Labs', 'APAC', 80000, 'Discovery', 'Iris'],
  ['Cedar Health', 'EMEA', 0, 'Qualified', null],
  ['Dune Energy', 'AMER', 240000, 'Negotiation', 'Tomas'],
  ['Ember Retail', 'EMEA', 150000, 'Negotiation', 'Lena'],
  ['Fjord Robotics', 'EMEA', 90000, 'Qualified', ''],
  ['Grove Logistics', 'APAC', null, 'Discovery', 'Ray'],
  ['Harbor Studio', 'AMER', 60000, 'Qualified', 'Daria'],
  ['Ion Research', 'EMEA', 110000, 'Qualified', 'Mateo'],
  ['Juniper Foods', 'APAC', 180000, 'Negotiation', 'Asha'],
]
const records = Object.fromEntries(
  rows.map((values, index) => {
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
const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map((field) => field.id)]
const view = (id: string, name: string) => ({
  id,
  tableId: 'records',
  name,
  type: BaseViewType.Grid,
  fieldOrder: [...fieldOrder],
  fieldSettings: Object.fromEntries(
    fieldOrder.map((field) => [
      field,
      { hidden: field === BASE_RECORD_ID_FIELD_ID, width: field === 'company' ? 240 : field === 'notes' ? 340 : 150 },
    ]),
  ),
  filter: null,
  sort: [],
  group: [],
  config: { frozenFieldCount: 1, rowHeight: 'medium' as const, showRecordIndex: true },
})
export const DATA: IBaseSnapshot = {
  id: 'filter-builder-base',
  name: 'Partner opportunities',
  schemaVersion: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  tableOrder: ['records'],
  tables: {
    records: {
      id: 'records',
      name: 'Partner opportunities',
      formulaName: 'DemoRecords',
      primaryFieldId: 'company',
      fields: {
        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
        ...Object.fromEntries(fields.map((field) => [field.id, field])),
      },
      fieldOrder,
      records,
      recordOrder: Object.keys(records),
      views: { working: view('working', 'Working view') },
      viewOrder: ['working'],
    },
  },
}
export const VARIANTS: { id: string; label: string; filter: IFilterConfig | null }[] = [
  {
    id: 'all',
    label: 'All opportunities',
    filter: null,
  },
  {
    id: 'and',
    label: 'EMEA AND budget ≥ 100,000',
    filter: {
      conjunction: BaseFilterConjunction.AND,
      conditions: [
        {
          fieldId: 'region',
          operator: BaseFilterOperator.IS,
          operand: 'EMEA',
        },
        {
          fieldId: 'budget',
          operator: BaseFilterOperator.GREATER_THAN_OR_EQUAL,
          operand: 100000,
        },
      ],
    },
  },
  {
    id: 'or',
    label: 'APAC OR budget ≥ 200,000',
    filter: {
      conjunction: BaseFilterConjunction.OR,
      conditions: [
        {
          fieldId: 'region',
          operator: BaseFilterOperator.IS,
          operand: 'APAC',
        },
        {
          fieldId: 'budget',
          operator: BaseFilterOperator.GREATER_THAN_OR_EQUAL,
          operand: 200000,
        },
      ],
    },
  },
  {
    id: 'blank',
    label: 'Owner is empty',
    filter: {
      conjunction: BaseFilterConjunction.AND,
      conditions: [
        {
          fieldId: 'owner',
          operator: BaseFilterOperator.IS_EMPTY,
        },
      ],
    },
  },
  {
    id: 'contains',
    label: 'Company contains labs',
    filter: {
      conjunction: BaseFilterConjunction.AND,
      conditions: [
        {
          fieldId: 'company',
          operator: BaseFilterOperator.CONTAINS,
          operand: 'labs',
        },
      ],
    },
  },
  {
    id: 'empty',
    label: 'No matching opportunities',
    filter: {
      conjunction: BaseFilterConjunction.AND,
      conditions: [
        {
          fieldId: 'budget',
          operator: BaseFilterOperator.GREATER_THAN,
          operand: 1000000000,
        },
      ],
    },
  },
]
