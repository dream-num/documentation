import type { IBoardData } from '@univerjs-pro/boards'
import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { serializeRecordLinkIds } from '@univerjs-pro/bases'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  BooleanNumber,
  createBaseRecordIdField,
  HorizontalAlign,
  LocaleType,
  VerticalAlign,
} from '@univerjs/core'

export const HOST_ID = 'cove-lending-desk'
export const CHILD_ID = 'cove-service-blueprint'
const REVIEW_TIME = Date.parse('2027-11-23T09:00:00Z')
export const STAGES = [
  ['Reserve', 'Explain the kit and confirm availability'],
  ['Collect', 'Check contents together at the desk'],
  ['Use', 'Make support and return details easy to find'],
  ['Return', 'Record condition before the next loan'],
] as const

const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
function table(
  id: string,
  name: string,
  definitions: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fields = [createBaseRecordIdField(), ...definitions]
  const fieldOrder = fields.map((item) => item.id)
  const records = Object.fromEntries(
    rows.map((values, index) => {
      const recordId = `${id}-${index + 1}`
      return [
        recordId,
        {
          id: recordId,
          orderKey: String(index).padStart(3, '0'),
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
        },
      ]
    }),
  )
  return {
    id,
    name,
    formulaName: id,
    primaryFieldId: 'title',
    fields: Object.fromEntries(fields.map((item) => [item.id, item])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'requests' ? 'Borrowing queue' : 'Service stages',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 225 : fieldId === 'next' ? 250 : fieldId === 'stage' ? 150 : 125,
            },
          ]),
        ),
        filter: null,
        sort: [],
        group: [],
        config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
      },
    },
  }
}

export function createHostData(): IBaseSnapshot {
  const touchpoints = table(
    'touchpoints',
    'Touchpoints',
    [field('title', 'Stage', BaseFieldType.Text), field('next', 'Service promise', BaseFieldType.Text)],
    STAGES.map(([title, next]) => ({ title, next })),
  )
  const rows = [
    ['Field recorder / R-104', 1, 'queued', 'Inez', 3, 'Confirm the microphone is included'],
    ['Tripod / R-105', 1, 'review', 'Owen', 2, 'Check the requested height range'],
    ['Projector / R-106', 2, 'ready', 'Priya', 1, 'Test the correct cable at collection'],
    ['Binoculars / R-107', 3, 'in-use', 'Inez', 4, 'Keep the return location visible'],
    ['Camera kit / R-108', 4, 'review', 'Owen', 2, 'Record the missing lens cap'],
    ['Lighting kit / R-109', 2, 'ready', 'Priya', 1, 'Count the stands with the borrower'],
    ['Audio interface / R-110', 1, 'queued', 'Eli', 3, 'Confirm connector compatibility'],
    ['Portable screen / R-111', 4, 'review', 'Eli', 1, 'Check the carry case before shelving'],
  ] as const
  const requests = table(
    'requests',
    'Requests',
    [
      field('title', 'Kit / request', BaseFieldType.Text),
      field('stage', 'Touchpoint', BaseFieldType.RecordLink, {
        targetTableId: 'touchpoints',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'Status', BaseFieldType.SingleSelect, {
        options: [
          { id: 'queued', name: 'Queued', color: '#647C99' },
          { id: 'ready', name: 'Ready', color: '#418B83' },
          { id: 'in-use', name: 'In use', color: '#8471B2' },
          { id: 'review', name: 'Review', color: '#B8773E' },
        ],
      }),
      field('owner', 'Desk owner', BaseFieldType.Text),
      field('days', 'Loan days', BaseFieldType.Number, { decimalPlaces: 0 }),
      field('next', 'Next service check', BaseFieldType.Text),
    ],
    rows.map(([title, stage, state, owner, days, next]) => ({
      title,
      stage: serializeRecordLinkIds([`touchpoints-${stage}`]),
      state,
      owner,
      days,
      next,
    })),
  )
  return {
    id: HOST_ID,
    name: 'Cove / The equipment lending desk',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['requests', 'touchpoints'],
    tables: { requests, touchpoints },
  }
}

function boardCard(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
  bold = false,
) {
  const shape = createBoardTextBoxShapeElement({
    id,
    text: value,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textWrap: ShapeTextWrapType.Square,
    textStyle: { ff: 'Arial', fs: size, bl: bold ? BooleanNumber.TRUE : BooleanNumber.FALSE, cl: { rgb: color } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  // Decorative lane backgrounds must not render the SDK's empty-text placeholder.
  if (!value) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}

const LANES = [
  { id: 'visitor', label: 'BORROWER', top: 200, fill: '#D8E8F3', background: '#F1F6F8' },
  { id: 'desk', label: 'FRONT DESK', top: 365, fill: '#DAD8F1', background: '#F4F1FA' },
  { id: 'support', label: 'BACKSTAGE', top: 530, fill: '#F4E0BD', background: '#FCF6EC' },
] as const
const CARDS = [
  ['visitor-reserve', 'visitor', 0, 'Choose a kit\nExplain the intended use.'],
  ['visitor-collect', 'visitor', 1, 'Collect together\nCheck parts at the desk.'],
  ['visitor-use', 'visitor', 2, 'Use with care\nKeep the support note.'],
  ['visitor-return', 'visitor', 3, 'Return the kit\nDescribe what changed.'],
  ['desk-reserve', 'desk', 0, 'Clarify the request\nCheck fit and stock.'],
  ['desk-collect', 'desk', 1, 'A clear handoff\nName the return point.'],
  ['desk-use', 'desk', 2, 'Make help visible\nShare a help contact.'],
  ['desk-return', 'desk', 3, 'Close the loop\nRecord missing parts.'],
  ['support-reserve', 'support', 0, 'Hold the right kit\nAvoid double booking.'],
  ['support-collect', 'support', 1, 'Prepare the case\nCheck each cable.'],
  ['support-use', 'support', 2, 'Keep notes usable\nSeparate fact from guess.'],
  ['support-return', 'support', 3, 'Check before reuse\nInspect, then restock.'],
] as const

export function createChildData(): IBoardData {
  const backgrounds = LANES.flatMap((lane) => [
    boardCard(lane.id + '-lane', '', 25, lane.top - 12, 1110, 144, 12, '#22365F', lane.background),
    boardCard(lane.id + '-label', lane.label, 55, lane.top + 25, 120, 60, 12, '#22365F', undefined, true),
  ])
  const cards = CARDS.map(([id, laneId, column, value]) => {
    const lane = LANES.find((row) => row.id === laneId)!
    return boardCard(id, value, 190 + column * 235, lane.top, 210, 120, 15, '#273D4D', lane.fill)
  })
  const edges: Array<[string, string, number, string, number]> = []
  for (const lane of LANES)
    for (let col = 0; col < 3; col++)
      edges.push([
        `${lane.id}-flow-${col}`,
        CARDS.find((row) => row[1] === lane.id && row[2] === col)![0],
        1,
        CARDS.find((row) => row[1] === lane.id && row[2] === col + 1)![0],
        3,
      ])
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 2; row++)
      edges.push([
        `handoff-${row}-${col}`,
        CARDS.find((card) => card[1] === LANES[row].id && card[2] === col)![0],
        2,
        CARDS.find((card) => card[1] === LANES[row + 1].id && card[2] === col)![0],
        0,
      ])
  const connectors = edges.map(([id, from, fromSide, to, toSide]) =>
    createBoardConnectorElement({
      id,
      start: { kind: 'shapeSite', shapeId: from, connectionSiteId: fromSide },
      end: { kind: 'shapeSite', shapeId: to, connectionSiteId: toSide },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: {
        stroke: id.startsWith('handoff') ? '#A2AFBA' : '#69869B',
        strokeWidth: 2,
        endMarker: { type: 'filledArrow' },
      },
    }),
  )
  const headers = STAGES.map(([title], index) =>
    boardCard(
      'stage-' + index,
      `0${index + 1} / ${title.toUpperCase()}`,
      190 + index * 235,
      124,
      210,
      50,
      18,
      index === 3 ? '#4F352D' : '#F5F7FF',
      index === 3 ? '#EBC7A5' : '#22365F',
      true,
    ),
  )
  const elements = [
    ...backgrounds,
    ...connectors,
    ...cards,
    ...headers,
    boardCard('board-title', 'COVE / A CLEARER BORROWING JOURNEY', 30, 25, 1090, 54, 29, '#22365F', undefined, true),
    boardCard(
      'board-footer',
      'Fictional service map. Arrows show intended handoffs, not automation or live record state.',
      80,
      696,
      1040,
      38,
      15,
      '#647985',
    ),
  ]
  return {
    id: CHILD_ID,
    name: 'Cove / Service blueprint',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1170, height: 760 },
    pageOrder: ['blueprint'],
    activePageId: 'blueprint',
    pages: {
      blueprint: {
        id: 'blueprint',
        name: 'Borrower, desk, backstage',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
        elementOrder: elements.map((el) => el.id),
      },
    },
  }
}
