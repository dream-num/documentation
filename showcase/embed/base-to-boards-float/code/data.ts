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

export const HOST_ID = 'flint-delivery-control'
export const CHILD_ID = 'flint-delivery-register'
export const PAGE_ID = 'delivery'
export const SOURCE_NAME = 'Flint Delivery'
const tasks = '[Flint Delivery]!Tasks'
const remaining = `SUMIF(${tasks}[Status],"<>Done",${tasks}[Hours])`
export const FORMULA_CARDS = [
  { id: 'remaining', formula: '=' + remaining, format: '#,##0" h"' },
  { id: 'open', formula: `=COUNTIF(${tasks}[Status],"<>Done")`, format: '0" items"' },
  { id: 'blocked', formula: `=COUNTIF(${tasks}[Status],"Blocked")`, format: '0" blocked"' },
  { id: 'completion', formula: `=COUNTIF(${tasks}[Status],"Done")/COUNTA(${tasks}[Task])`, format: '0%' },
  ...['Content', 'Build', 'Access'].map((team) => ({
    id: team.toLowerCase() + '-remaining',
    formula: `=SUMIFS(${tasks}[Hours],${tasks}[Status],"<>Done",${tasks}[Stream],"${team}")`,
    format: '#,##0" h"',
  })),
  { id: 'retained', formula: `=SUM(${tasks}[Hours])`, format: '#,##0" h"' },
  {
    id: 'signal',
    formula: `=IF(COUNTIF(${tasks}[Status],"Blocked")>0,"Unblock first","Review next step")`,
    format: 'General',
  },
]
const TIME = Date.parse('2029-06-18T09:00:00Z')
export const TASKS = [
  ['Write field guide', 'Content', 'Open', 12, 'Nora', 'Draft four illustrated sections.'],
  ['Assemble kiosk', 'Build', 'Blocked', 8, 'Kenji', 'Wait for the mounting bracket.'],
  ['Review transcript', 'Access', 'Blocked', 5, 'Imani', 'Wait for the revised narration.'],
  ['Test sample panel', 'Build', 'Done', 4, 'Luca', 'Retain the estimate after completion.'],
  ['Outline visitor route', 'Content', 'Done', 6, 'Ari', 'Baseline route already reviewed.'],
] as const

function card(
  id: string,
  text: string,
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
    text,
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
  if (!text) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}
function formula(id: string, left: number, top: number, width: number, height: number, size: number, color: string) {
  const shape = card(id, '', left, top, width, height, size, color)
  shape.shapeData = {
    ...createFormulaShapeData({
      numberFormatPattern: FORMULA_CARDS.find((s) => s.id === id)!.format,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      textStyle: { ff: 'Arial', fs: size, bl: 1, cl: { rgb: color } },
    }),
    shapeType: ShapeTypeEnum.Rect,
  }
  return shape
}
export function createHostData(): IBoardData {
  const panels = [
    ['remaining', 'REMAINING / EXCLUDES DONE', '#E3E9F4', '#334B78'],
    ['open', 'OPEN / INCLUDES BLOCKED', '#E4EEE8', '#365D4D'],
    ['blocked', 'BLOCKED / NEEDS A DECISION', '#F5E0D6', '#8D533F'],
    ['completion', 'DONE / RECORD COUNT', '#EFE6F4', '#715280'],
  ] as const
  const lanes = [
    ['content', '01 / CONTENT', 'Write the story people will use.', '#E3E9F4', '#334B78'],
    ['build', '02 / BUILD', 'Release the bracket hold.', '#F5E0D6', '#8D533F'],
    ['access', '03 / ACCESS', 'Check revised narration.', '#EFE6F4', '#715280'],
  ] as const
  const shapes = [
    card('title-band', '', 65, 40, 1510, 125, 12, '#1D2940', '#1D2940'),
    card('title', 'FLINT / MOVE WORK, NOT NUMBERS', 95, 52, 1420, 65, 32, '#FFF8E9', undefined, true),
    card(
      'subtitle',
      'A fictional visitor-centre installation / Delivery review / 18 June 2029',
      98,
      122,
      1400,
      30,
      15,
      '#B8CAE2',
    ),
    ...panels.flatMap(([id, label, fill, ink], i) => [
      card(id + '-panel', '', 80 + i * 375, 194, 350, 126, 12, ink, fill),
      card(id + '-label', label, 100 + i * 375, 208, 315, 24, 12, ink, undefined, true),
      formula(id, 100 + i * 375, 247, 310, 58, 33, ink),
    ]),
    card(
      'source-caption',
      'SOURCE / Five records, one live Base. Double-click to edit.',
      85,
      340,
      920,
      30,
      15,
      '#435A74',
      undefined,
      true,
    ),
    card('lanes-caption', 'DEPENDENTS / Open effort by stream', 1090, 340, 445, 30, 14, '#435A74', undefined, true),
    ...lanes.flatMap(([id, label, detail, fill, ink], i) => [
      card(id + '-panel', '', 1090, 397 + i * 157, 450, 126, 12, ink, fill),
      card(id + '-label', label, 1110, 406 + i * 157, 400, 25, 15, ink, undefined, true),
      formula(id + '-remaining', 1110, 446 + i * 157, 150, 50, 32, ink),
      card(id + '-detail', detail, 1270, 443 + i * 157, 245, 65, 15, ink),
    ]),
    card('signal-label', 'NEXT CONVERSATION', 90, 900, 230, 30, 13, '#435A74', undefined, true),
    formula('signal', 320, 894, 375, 40, 25, '#8D533F'),
    card('retained-label', 'ALL ESTIMATES / INCLUDING DONE', 890, 900, 380, 30, 13, '#435A74', undefined, true),
    formula('retained', 1290, 891, 240, 45, 27, '#435A74'),
    card(
      'footer',
      'Done removes work from the open subtotal; it does not erase estimates. Whole-table formulas do not imply view-filter awareness. No live project or publishing.',
      88,
      961,
      1450,
      48,
      14,
      '#6C7785',
    ),
  ]
  const connectors = lanes.map(([id, , , , ink]) =>
    createBoardConnectorElement({
      id: 'source-to-' + id,
      start: { kind: 'shapeSite', shapeId: 'source-caption', connectionSiteId: 1 },
      end: { kind: 'shapeSite', shapeId: id + '-panel', connectionSiteId: 3 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: ink, strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: HOST_ID,
    name: 'Flint / Delivery control room',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1660, height: 1050 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Delivery dependencies',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
export function createChildData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Task', type: BaseFieldType.Text, config: {} },
    { id: 'stream', name: 'Stream', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Open', name: 'Open', color: '#688DAC' },
          { id: 'Blocked', name: 'Blocked', color: '#BD7A5D' },
          { id: 'Done', name: 'Done', color: '#719884' },
        ],
      },
    },
    { id: 'hours', name: 'Hours', type: BaseFieldType.Number, config: {} },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Next step', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    TASKS.map(([title, stream, status, hours, owner, note], i) => {
      const id = 'task-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, stream, status, hours, owner, note },
        },
      ]
    }),
  )
  return {
    id: CHILD_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['tasks'],
    tables: {
      tasks: {
        id: 'tasks',
        name: 'Tasks',
        formulaName: 'Tasks',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['tasks-grid'],
        views: {
          'tasks-grid': {
            id: 'tasks-grid',
            tableId: 'tasks',
            name: 'Delivery register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 215 : id === 'note' ? 300 : id === 'hours' ? 90 : 115,
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
