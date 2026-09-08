import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { normalizeBaseDateSerial, serializeRecordLinkIds } from '@univerjs-pro/bases'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
  RichTextBuilder,
} from '@univerjs/core'

export const HOST_ID = 'copper-retail-launch'
export const CHILD_ID = 'copper-channel-workstreams'
const REVIEW_TIME = Date.parse('2027-11-09T09:00:00Z')

type SlideElement = ISlideData['slides'][string]['elements'][string]
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  bold = false,
): SlideElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color, bold }).getData()
  doc.id = `${id}-text`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function panel(id: string, left: number, top: number, width: number, height: number, color: string): SlideElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
function slide(id: string, name: string, background: string, elements: SlideElement[]): ISlideData['slides'][string] {
  return {
    id,
    name,
    pageType: PageTypeEnum.Slide,
    background: { type: SlideBackgroundTypeEnum.Solid, color: background },
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    elementOrder: elements.map((element) => element.id),
    speakerNotes:
      'Original fictional retail pilot. Narrative slides are not live Formula Shapes. No orders, messages or approvals are sent.',
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
        name: id === 'workstreams' ? 'Launch triage' : 'Channel directory',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 245 : fieldId === 'next' ? 280 : fieldId === 'channel' ? 160 : 140,
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

export function createHostData(): ISlideData {
  const pages = [
    slide('launch', 'A small launch, well supported', '#F6F0E8', [
      text('launch-kicker', 'COPPER / REFILL STARTER KIT / PILOT REVIEW', 48, 42, 540, 32, 14, '#934E37', true),
      text('launch-title', 'Start small.\nSupport every refill.', 48, 119, 540, 150, 40, '#422D24', true),
      text(
        'launch-intro',
        'A reusable bottle is only the beginning. Our pilot tests labels, staff handoffs and repeat visits across four different channels.',
        48,
        296,
        515,
        116,
        22,
        '#725C50',
      ),
      text('launch-link', 'OPEN PAGE 2 / Launch workstream', 48, 451, 535, 45, 21, '#934E37', true),
      panel('launch-side', 634, 0, 366, 562.5, '#934E37'),
      text('launch-number', '04', 678, 77, 266, 135, 88, '#F9E5CA', true),
      text('launch-number-label', 'channels, not one playbook', 678, 218, 273, 75, 24, '#F9E5CA', true),
      text(
        'launch-side-note',
        'Specialist shop\nNeighborhood co-op\nWeekend pop-up\nDirect preorder',
        678,
        331,
        270,
        165,
        21,
        '#F5D8C8',
      ),
      text(
        'launch-footer',
        'Original fictional case / 9 November 2027 / No orders or notifications are sent',
        48,
        527,
        560,
        26,
        11,
        '#725C50',
      ),
    ]),
    slide('channels', 'One product, four handoffs', '#233B4A', [
      text('channels-kicker', '03 / CHANNEL DESIGN', 48, 42, 900, 30, 14, '#C7DCE4', true),
      text('channels-title', 'The handoff is part of the product.', 48, 94, 904, 88, 35, '#F9EFE1', true),
      panel('retail-card', 48, 216, 435, 222, '#F1D8C5'),
      panel('direct-card', 514, 216, 435, 222, '#CADDE1'),
      text('retail-title', 'AT THE COUNTER', 71, 239, 389, 39, 22, '#623B2C', true),
      text(
        'retail-note',
        'Show the refill routine.\nMake labels easy to read.\nKeep recovery notes with staff.',
        71,
        302,
        389,
        113,
        20,
        '#623B2C',
      ),
      text('direct-title', 'BEFORE ARRIVAL', 537, 239, 389, 39, 22, '#284857', true),
      text(
        'direct-note',
        'Explain the collection window.\nConfirm packaging availability.\nKeep preorder promises limited.',
        537,
        302,
        389,
        113,
        20,
        '#284857',
      ),
      text(
        'channels-footer',
        'Rename a channel in the Relational Table. Linked workstream labels follow its stable record ID.',
        48,
        480,
        905,
        60,
        19,
        '#C7DCE4',
      ),
    ]),
    slide('gate', 'Evidence before expansion', '#E1D8E7', [
      text('gate-kicker', '04 / REVIEW GATE', 48, 42, 904, 32, 14, '#674F75', true),
      text('gate-title', 'A status is not a launch decision.', 48, 102, 904, 86, 36, '#41344B', true),
      text('gate-ready', 'READY / Staff can demonstrate the first refill.', 65, 230, 870, 54, 25, '#41344B', true),
      text('gate-hold', 'HOLD / Label proof and pack test need evidence.', 65, 324, 870, 54, 25, '#41344B', true),
      text(
        'gate-review',
        'REVIEW / Learn from the pilot before adding channels.',
        65,
        418,
        870,
        54,
        25,
        '#41344B',
        true,
      ),
      text(
        'gate-footer',
        'Narrative slides remain independent of Relational Table edits. Reload resets local data; changing theme preserves it.',
        48,
        510,
        904,
        37,
        14,
        '#674F75',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Copper / Retail pilot review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 562.5 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: 'launch',
  }
}

export function createChildData(): IBaseSnapshot {
  const channels = table(
    'channels',
    'Channels',
    [
      field('title', 'Channel', BaseFieldType.Text),
      field('lead', 'Pilot lead', BaseFieldType.Text),
      field('reach', 'Initial audience', BaseFieldType.Text),
      field('constraint', 'Operating constraint', BaseFieldType.Text),
    ],
    [
      { title: 'Harbor Home', lead: 'Nina Bell', reach: '24 invited households', constraint: 'Counter demo required' },
      {
        title: 'Elm Street Co-op',
        lead: 'Idris Shaw',
        reach: '18 member households',
        constraint: 'Member pickup evenings',
      },
      {
        title: 'Saturday Market',
        lead: 'Rosa Lin',
        reach: '30 demonstration slots',
        constraint: 'Weather backup needed',
      },
      {
        title: 'Direct preorder',
        lead: 'Owen Lake',
        reach: '20 collection requests',
        constraint: 'No shipping in the pilot',
      },
    ],
  )
  const tasks = [
    ['Counter demonstration', 1, 'ready', 'Nina', -1, 'Staff rehearsal recorded; bottles remain demonstration stock.'],
    ['Ingredient label proof', 1, 'blocked', 'Idris', 1, 'Waiting for the large-type proof to be reviewed.'],
    ['Pickup window copy', 2, 'review', 'Rosa', 2, 'Two evening collection windows need clear wording.'],
    ['Member briefing', 2, 'ready', 'Nina', 0, 'Co-op desk team has the refill and recovery notes.'],
    ['Wet-weather fallback', 3, 'blocked', 'Owen', 3, 'Confirm a sheltered table before opening bookings.'],
    ['Portable spill kit', 3, 'review', 'Idris', 1, 'Check the cleanup pack against the rehearsal checklist.'],
    ['Preorder landing copy', 4, 'review', 'Rosa', 4, 'Make collection-only scope explicit above the form.'],
    ['Bottle pack test', 4, 'planned', 'Owen', 5, 'Rehearse handling without implying shipping is available.'],
    ['Refill follow-up card', 1, 'planned', 'Rosa', 7, 'Write one useful question for the second visit.'],
    ['Pilot retrospective', 2, 'planned', 'Nina', 14, 'Compare recovery effort before expanding the cohort.'],
  ] as const
  const workstreams = table(
    'workstreams',
    'Workstreams',
    [
      field('title', 'Workstream', BaseFieldType.Text),
      field('channel', 'Channel', BaseFieldType.RecordLink, {
        targetTableId: 'channels',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'State', BaseFieldType.SingleSelect, {
        options: [
          { id: 'ready', name: 'Ready', color: '#597C70' },
          { id: 'review', name: 'In review', color: '#AC7440' },
          { id: 'blocked', name: 'Blocked', color: '#9B5360' },
          { id: 'planned', name: 'Planned', color: '#607C9B' },
        ],
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('next', 'Evidence / next step', BaseFieldType.Text),
    ],
    tasks.map(([title, channel, state, owner, day, next]) => ({
      title,
      channel: serializeRecordLinkIds([`channels-${channel}`]),
      state,
      owner,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
      next,
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Copper / Launch workstreams',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['workstreams', 'channels'],
    tables: { workstreams, channels },
  }
}
