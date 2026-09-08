import type { IBoardData } from '@univerjs-pro/boards'
import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { normalizeBaseDateSerial, serializeRecordLinkIds } from '@univerjs-pro/bases'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
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

export const HOST_ID = 'grove-route-research'
export const CHILD_ID = 'grove-research-backlog'
export const PAGE_ID = 'research'
const REVIEW_TIME = Date.parse('2028-05-16T09:00:00Z')
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

export function createHostData(): IBoardData {
  const elements = [
    boardCard('title-band', '', 90, 45, 1470, 125, 12, '#29473D', '#29473D'),
    boardCard('story-title', 'GROVE / A ROUTE PEOPLE CAN CHOOSE', 115, 65, 1370, 62, 29, '#F0F5E8', undefined, true),
    boardCard(
      'story-subtitle',
      'Park-route research / Synthetic observations / 16 May 2028',
      118,
      130,
      1350,
      30,
      14,
      '#BED5C9',
    ),
    boardCard(
      'wayfinding',
      '01 / FIND THE START\nA turn cue arrives too late.\nWhere should it appear?',
      110,
      225,
      340,
      120,
      17,
      '#344B61',
      '#DEEAF3',
    ),
    boardCard(
      'comfort',
      '02 / STAY COMFORTABLE\nShade and seats are uneven.\nShow a rest choice early.',
      110,
      375,
      340,
      120,
      17,
      '#725138',
      '#F5E4CE',
    ),
    boardCard(
      'access',
      '03 / CHOOSE ACCESS\nA slope label is missing.\nCheck the route on foot.',
      110,
      525,
      340,
      120,
      17,
      '#554B70',
      '#E8E1F2',
    ),
    boardCard(
      'trust',
      '04 / TRUST THE ROUTE\nOpening times can change.\nName who checks them.',
      110,
      675,
      340,
      120,
      17,
      '#754D59',
      '#F1DDE4',
    ),
    boardCard('base-caption', '9 RESEARCH QUESTIONS', 705, 183, 290, 30, 13, '#426B5A', undefined, true),
    boardCard(
      'decision-note',
      'NEXT / Test route choices before drawing new signs.',
      510,
      870,
      1040,
      80,
      19,
      '#315447',
      '#E1EFD9',
      true,
    ),
    boardCard(
      'board-footer',
      'All observations and names are fictional. Base records do not approve access, publish signs or update these notes.',
      115,
      995,
      1420,
      60,
      14,
      '#66786D',
    ),
  ]
  return {
    id: HOST_ID,
    name: 'Grove / Park-route discovery',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1660, height: 1120 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Observe, question, test',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
        elementOrder: elements.map((el) => el.id),
      },
    },
  }
}
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
  const fieldOrder = fields.map((definition) => definition.id)
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
    fields: Object.fromEntries(fields.map((definition) => [definition.id, structuredClone(definition)])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'questions' ? 'Research queue' : 'Theme directory',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width:
                fieldId === 'title'
                  ? 235
                  : fieldId === 'evidence'
                    ? 360
                    : fieldId === 'scope'
                      ? 380
                      : fieldId === 'method'
                        ? 320
                        : 135,
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

export function createChildData(): IBaseSnapshot {
  const themes = table(
    'themes',
    'Themes',
    [
      field('title', 'Theme', BaseFieldType.Text),
      field('scope', 'Research boundary', BaseFieldType.Text),
      field('lead', 'Lead', BaseFieldType.Text),
      field('method', 'Next method', BaseFieldType.Text),
    ],
    [
      {
        title: 'Wayfinding',
        scope: 'Start points, turns and route choices',
        lead: 'Nora Ali',
        method: 'Walk-and-point prototype',
      },
      {
        title: 'Comfort',
        scope: 'Rest choices, shade and water information',
        lead: 'Kenji Mori',
        method: 'Timed comfort walk',
      },
      {
        title: 'Access',
        scope: 'Surface, slope and alternative-route information',
        lead: 'Imani Cole',
        method: 'Route review with access adviser',
      },
      {
        title: 'Trust',
        scope: 'Opening times, distance labels and maintenance ownership',
        lead: 'Luca Silva',
        method: 'Content ownership check',
      },
    ],
  )
  const rows = [
    [
      'Late turn cue',
      1,
      'evidence',
      'Nora Ali',
      0,
      'Medium',
      'A synthetic walk note places the first cue after the path split.',
    ],
    [
      'Rest-stop choice',
      2,
      'queued',
      'Kenji Mori',
      2,
      'Low',
      'Compare a shaded short loop with the longer waterside option.',
    ],
    [
      'Missing slope label',
      3,
      'blocked',
      'Imani Cole',
      1,
      'Low',
      'Await route measurement before writing any access claim.',
    ],
    [
      'Gate hours mismatch',
      4,
      'evidence',
      'Luca Silva',
      -1,
      'High',
      'Two fictional draft signs list different closing times.',
    ],
    [
      'Start-point landmark',
      1,
      'assumption',
      'Nora Ali',
      3,
      'Low',
      'Test whether the red kiosk is a clearer cue than a compass direction.',
    ],
    [
      'Water-point wording',
      2,
      'queued',
      'Kenji Mori',
      4,
      'Medium',
      'Ask walkers to locate refill information without a phone.',
    ],
    [
      'Step-free detour',
      3,
      'queued',
      'Imani Cole',
      5,
      'Medium',
      'Review the alternative path; do not label it accessible without evidence.',
    ],
    [
      'Distance label units',
      4,
      'assumption',
      'Luca Silva',
      6,
      'Low',
      'Compare minutes and metres; neither should imply a guaranteed pace.',
    ],
    [
      'Exit-route recall',
      1,
      'evidence',
      'Nora Ali',
      7,
      'Medium',
      'A fictional recall note confuses the exit with the route start.',
    ],
  ] as const
  const questions = table(
    'questions',
    'Questions',
    [
      field('title', 'Research question', BaseFieldType.Text),
      field('theme', 'Theme', BaseFieldType.RecordLink, {
        targetTableId: 'themes',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'State', BaseFieldType.SingleSelect, {
        options: [
          { id: 'evidence', name: 'Evidence note', color: '#6B947A' },
          { id: 'queued', name: 'Test queued', color: '#688DAC' },
          { id: 'assumption', name: 'Assumption', color: '#B98C4D' },
          { id: 'blocked', name: 'Needs evidence', color: '#A66C83' },
        ],
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('confidence', 'Confidence', BaseFieldType.SingleSelect, {
        options: [
          { id: 'Low', name: 'Low', color: '#B9976A' },
          { id: 'Medium', name: 'Medium', color: '#8A82AF' },
          { id: 'High', name: 'High', color: '#6B947A' },
        ],
      }),
      field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('evidence', 'Evidence / next question', BaseFieldType.Text),
    ],
    rows.map(([title, theme, state, owner, day, confidence, evidence]) => ({
      title,
      theme: serializeRecordLinkIds(['themes-' + theme]),
      state,
      owner,
      confidence,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
      evidence,
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Grove / Route research backlog',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['questions', 'themes'],
    tables: { questions, themes },
  }
}
