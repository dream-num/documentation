import type { IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
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

export const HOST_ID = 'reed-repair-station'
export const CHILD_ID = 'reed-operations-map'
export const PAGE_ID = 'operations'
export const SOURCE_NAME = 'Reed Operations'
export const STREAMS = [
  ['Intake', 14, 18, 'Ready', 'Jules', 'Label each item and record the requested repair.'],
  ['Repair', 9, 12, 'Blocked', 'Samira', 'One shared workbench awaits a replacement vise.'],
  ['Handover', 7, 10, 'Ready', 'Noah', 'Explain the repair and demonstrate the final check.'],
] as const
const table = '[Reed Operations]!Streams'
const totalLoad = `SUM(${table}[Load])`,
  totalCapacity = `SUM(${table}[Capacity])`
const streamValue = (name: string, field: string) => `SUMIF(${table}[Stream],"${name}",${table}[${field}])`
const overloaded = STREAMS.map(
  ([name]) => `IF(${streamValue(name, 'Load')}>${streamValue(name, 'Capacity')},1,0)`,
).join('+')
const blocked = `COUNTIF(${table}[Status],"Blocked")`
export const FORMULA_CARDS = [
  { id: 'total', formula: '=' + totalLoad, format: '0" h"' },
  { id: 'capacity', formula: '=' + totalCapacity, format: '0" h"' },
  { id: 'utilization', formula: `=${totalLoad}/${totalCapacity}`, format: '0.0%' },
  ...STREAMS.flatMap(([name], i) => [
    { id: 'load-' + i, formula: '=' + streamValue(name, 'Load'), format: '0" h"' },
    {
      id: 'spare-' + i,
      formula: '=' + streamValue(name, 'Capacity') + '-' + streamValue(name, 'Load'),
      format: '0" h"',
    },
  ]),
  { id: 'blocked', formula: '=' + blocked, format: '0" blocked"' },
  { id: 'overloaded', formula: '=' + overloaded, format: '0" over capacity"' },
  {
    id: 'signal',
    formula: `=IF((${overloaded})>0,"Rebalance the load",IF(${blocked}>0,"Resolve the blocker","Ready to review"))`,
    format: 'General',
  },
]
const TIME = Date.parse('2029-09-07T09:00:00Z')

function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  ink: string,
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
    textStyle: { ff: 'Arial', fs: size, bl: bold ? BooleanNumber.TRUE : BooleanNumber.FALSE, cl: { rgb: ink } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  if (!value) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}
function formula(id: string, x: number, y: number, width: number, size: number, ink: string) {
  const shape = text(id, '', x, y, width, 60, size, ink)
  shape.shapeData = {
    ...createFormulaShapeData({
      numberFormatPattern: FORMULA_CARDS.find((s) => s.id === id)!.format,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      textStyle: { ff: 'Arial', fs: size, bl: 1, cl: { rgb: ink } },
    }),
    shapeType: ShapeTypeEnum.Rect,
  }
  return shape
}
export function createChildData(): IBoardData {
  const colors = [
    ['#DCEDE7', '#285F51'],
    ['#F6E4CB', '#80592C'],
    ['#EAE2F7', '#624980'],
  ]
  const shapes = [
    text('header', '', 40, 30, 1380, 120, 12, '#101A34', '#101A34'),
    text('title', 'REED / MAKE ROOM FOR THE NEXT REPAIR', 64, 46, 1320, 54, 32, '#F5F7FF', undefined, true),
    text(
      'subtitle',
      'Community repair station / Three workstreams / Planning hours, not completed repairs',
      67,
      105,
      1310,
      32,
      16,
      '#58C8FF',
    ),
    ...[
      ['total', 'ASSIGNED LOAD', '#DCEDE7', '#285F51'],
      ['capacity', 'AVAILABLE CAPACITY', '#E0E8F7', '#304E7D'],
      ['utilization', 'LOAD / CAPACITY', '#F6E4CB', '#80592C'],
    ].flatMap(([id, label, fill, ink], i) => [
      text(id + '-panel', '', 40 + i * 470, 175, 440, 125, 12, ink, fill),
      text(id + '-label', label, 60 + i * 470, 185, 400, 28, 15, ink, undefined, true),
      formula(id, 60 + i * 470, 226, 390, 39, ink),
    ]),
    text('source-node', 'ONE BASE / THREE CONNECTED WORKSTREAMS', 430, 327, 600, 52, 18, '#22365F', '#E0E8F7', true),
    ...STREAMS.flatMap(([name, , , , owner, note], i) => {
      const x = 40 + i * 470,
        [fill, ink] = colors[i]
      return [
        text('stream-' + i, '', x, 427, 440, 224, 12, ink, fill),
        text(
          'stream-title-' + i,
          '0' + (i + 1) + ' / ' + name.toUpperCase(),
          x + 18,
          435,
          402,
          42,
          24,
          ink,
          undefined,
          true,
        ),
        text('load-label-' + i, 'ASSIGNED', x + 18, 492, 183, 24, 13, ink, undefined, true),
        text('spare-label-' + i, 'REMAINING', x + 228, 492, 190, 24, 13, ink, undefined, true),
        formula('load-' + i, x + 18, 524, 188, 34, ink),
        formula('spare-' + i, x + 228, 524, 190, 34, ink),
        text('stream-note-' + i, owner + ' / ' + note, x + 18, 587, 402, 52, 14, ink),
      ]
    }),
    text('review-band', '', 40, 700, 1380, 136, 12, '#F5F7FF', '#22365F'),
    text('blocked-label', 'WORKFLOW STATUS', 62, 708, 310, 30, 13, '#C8D0E4', undefined, true),
    formula('blocked', 62, 750, 315, 29, '#F2B84B'),
    text('overloaded-label', 'PER-STREAM LOAD > CAPACITY', 412, 708, 425, 30, 13, '#C8D0E4', undefined, true),
    formula('overloaded', 412, 750, 425, 29, '#B6A6FF'),
    text('signal-label', 'NEXT CONVERSATION / NATIVE IF', 875, 708, 515, 30, 13, '#C8D0E4', undefined, true),
    formula('signal', 875, 750, 510, 29, '#50C8B0'),
    text(
      'footer',
      'Whole-table formulas include hidden records. Negative remaining capacity means overload. Arrows show dependency, not an automated handoff.',
      45,
      858,
      1370,
      54,
      15,
      '#53687E',
    ),
  ]
  const connectors = STREAMS.map((_, i) =>
    createBoardConnectorElement({
      id: 'source-to-stream-' + i,
      start: { kind: 'shapeSite', shapeId: 'source-node', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: 'stream-' + i, connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: colors[i][1], strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: CHILD_ID,
    name: 'Reed / Operations map',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1460, height: 940 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Repair station / Workstream capacity',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
export function createHostData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Stream', type: BaseFieldType.Text, config: {} },
    { id: 'load', name: 'Load', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'capacity', name: 'Capacity', type: BaseFieldType.Number, config: { precision: 0 } },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Ready', name: 'Ready', color: '#50C8B0' },
          { id: 'Blocked', name: 'Blocked', color: '#F2B84B' },
        ],
      },
    },
    { id: 'owner', name: 'Lead', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Context', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    STREAMS.map(([title, load, capacity, status, owner, note], i) => {
      const id = 'stream-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, load, capacity, status, owner, note },
        },
      ]
    }),
  )
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['streams'],
    tables: {
      streams: {
        id: 'streams',
        name: 'Workstream register',
        formulaName: 'Streams',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['streams-grid'],
        views: {
          'streams-grid': {
            id: 'streams-grid',
            tableId: 'streams',
            name: 'Repair station workload',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 220 : id === 'note' ? 440 : 130,
                },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
          },
        },
      },
    },
  }
}
