import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot } from '@univerjs/core'
import { serializeRecordLinkIds } from '@univerjs-pro/bases'
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

export const HOST_ID = 'avenue-campaign-operations'
export const CHILD_ID = 'avenue-campaign-review'
const REVIEW_TIME = Date.parse('2027-11-09T09:00:00Z')
export const CHANNELS = [
  { title: 'Studio partners', budget: 4300, next: 'Confirm three host locations', color: '#9B7BFF' },
  { title: 'Web discovery', budget: 3300, next: 'Check the booking explanation', color: '#58C8FF' },
  { title: 'Newsletter', budget: 2000, next: 'Review the two message versions', color: '#F37B78' },
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
        name: id === 'deliverables' ? 'Launch checklist' : 'Channel plan',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 225 : fieldId === 'next' ? 250 : fieldId === 'channel' ? 150 : 125,
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
  const channels = table(
    'channels',
    'Channels',
    [
      field('title', 'Channel', BaseFieldType.Text),
      field('budget', 'Budget / CNY', BaseFieldType.Number, {
        decimalPlaces: 0,
        useThousands: true,
        separatorStyle: 'commaPeriod',
      }),
      field('next', 'Planning question', BaseFieldType.Text),
    ],
    CHANNELS.map(({ title, budget, next }) => ({ title, budget, next })),
  )
  const rows = [
    ['Window story cards', 1, 'review', 'Mina', 2400, 'Check opening hours on the cards'],
    ['Landing page', 2, 'draft', 'Theo', 1800, 'Explain materials and session length'],
    ['Artist interview clips', 2, 'planned', 'Luca', 900, 'Confirm caption and image permissions'],
    ['Host conversation kit', 1, 'ready', 'Mina', 1500, 'Add the beginner-friendly introduction'],
    ['First invitation', 3, 'draft', 'Asha', 1200, 'Keep one clear booking link'],
    ['Follow-up note', 3, 'planned', 'Asha', 800, 'Clarify who opted in'],
    ['Booking FAQ', 2, 'review', 'Theo', 600, 'Check cancellation wording'],
    ['Doorway wayfinding', 1, 'planned', 'Luca', 400, 'Test the route after sunset'],
  ] as const
  const deliverables = table(
    'deliverables',
    'Deliverables',
    [
      field('title', 'Deliverable', BaseFieldType.Text),
      field('channel', 'Channel', BaseFieldType.RecordLink, {
        targetTableId: 'channels',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('state', 'Stage', BaseFieldType.SingleSelect, {
        options: [
          { id: 'planned', name: 'Planned', color: '#9B7BFF' },
          { id: 'draft', name: 'Draft', color: '#6688FF' },
          { id: 'review', name: 'Review', color: '#D98C5F' },
          { id: 'ready', name: 'Ready', color: '#50C8B0' },
        ],
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('budget', 'Budget / CNY', BaseFieldType.Number, {
        decimalPlaces: 0,
        useThousands: true,
        separatorStyle: 'commaPeriod',
      }),
      field('next', 'Next check', BaseFieldType.Text),
    ],
    rows.map(([title, channel, state, owner, budget, next]) => ({
      title,
      channel: serializeRecordLinkIds([`channels-${channel}`]),
      state,
      owner,
      budget,
      next,
    })),
  )
  return {
    id: HOST_ID,
    name: 'Avenue / After-work studio campaign',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['deliverables', 'channels'],
    tables: { deliverables, channels },
  }
}

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
      'Original fictional campaign assumptions. Slides and Base records are independent snapshots; editing a value does not recalculate the other product. No messages, tracking, publication or Formula Shape integration.',
  }
}

export function createChildData(): ISlideData {
  const pages = [
    slide('brief', 'The invitation', '#101A34', [
      panel('cover-rule', 40, 42, 70, 5, '#F37B78'),
      text('cover-kicker', 'AVENUE / AFTER-WORK STUDIO PASS', 40, 62, 690, 30, 13, '#B6A6FF', true),
      text('cover-title', 'Make room\nfor making.', 40, 112, 470, 150, 47, '#F5F7FF', true),
      text(
        'cover-body',
        'A small creative session after work.\nOne material. One technique. No portfolio needed.',
        40,
        285,
        470,
        75,
        18,
        '#C8D0E4',
      ),
      panel('cover-card', 565, 123, 190, 236, '#22365F'),
      text('cover-number', '09', 585, 144, 150, 75, 62, '#F37B78', true),
      text('cover-sessions', 'SESSIONS', 585, 227, 153, 30, 12, '#B6A6FF', true),
      text('cover-seats', '72 seats\n3 studios\n3 weeks', 585, 270, 150, 82, 14, '#F5F7FF'),
      text(
        'cover-footer',
        'Planning draft / 9 November 2027 / Original fictional campaign',
        40,
        402,
        705,
        25,
        11,
        '#8CBFD4',
      ),
    ]),
    slide('allocation', 'Budget by channel', '#F5F7FF', [
      text('budget-kicker', '02 / ALLOCATION, NOT ATTRIBUTION', 40, 28, 715, 30, 13, '#6755A1', true),
      text('budget-title', 'CNY 9,600 to learn locally.', 40, 72, 710, 62, 32, '#101A34', true),
      ...CHANNELS.flatMap((channel, index) => {
        const top = 157 + index * 65
        return [
          text(`channel-${index}-label`, channel.title, 40, top, 180, 32, 17, '#22365F', true),
          panel(`channel-${index}-track`, 230, top + 6, 405, 24, '#E5E9F3'),
          panel(`channel-${index}-bar`, 230, top + 6, (405 * channel.budget) / 4300, 24, channel.color),
          text(
            `channel-${index}-budget`,
            channel.budget.toLocaleString('en-US'),
            662,
            top,
            95,
            35,
            20,
            '#22365F',
            true,
          ),
        ]
      }),
      text(
        'budget-note',
        'Eight deliverables share this starting plan.\nChannel labels and budgets in the deck are not live-linked to Base.',
        40,
        362,
        710,
        60,
        15,
        '#59647C',
      ),
    ]),
    slide('sequence', 'Three learning weeks', '#FFF4E8', [
      text('sequence-kicker', '03 / A SMALL CAMPAIGN, A CLEAR SEQUENCE', 40, 28, 710, 30, 13, '#9D623B', true),
      text('sequence-title', 'Clarity before reach.', 40, 72, 710, 62, 35, '#413043', true),
      ...[
        ['01', 'Explain', 'Mina + Theo', 'Check the offer, location\nand booking FAQ.', '#E8DEF5'],
        ['02', 'Invite', 'Asha + Luca', 'Review the invitation\nand studio wayfinding.', '#F7D9D4'],
        ['03', 'Learn', 'All four owners', 'Compare attendance\nand useful feedback.', '#DDEBE5'],
      ].flatMap(([number, title, owner, body, color], index) => {
        const left = 40 + index * 245
        return [
          panel(`week-${index}-card`, left, 163, 225, 200, color),
          text(`week-${index}-number`, number, left + 16, 177, 190, 48, 31, '#413043', true),
          text(`week-${index}-title`, title, left + 16, 232, 190, 37, 24, '#413043', true),
          text(`week-${index}-owner`, owner, left + 16, 276, 190, 27, 12, '#67566B', true),
          text(`week-${index}-body`, body, left + 16, 307, 196, 52, 13, '#413043'),
        ]
      }),
      text(
        'sequence-footer',
        'This is a plan, not an automated schedule or an outbound campaign.',
        40,
        400,
        720,
        26,
        12,
        '#67566B',
      ),
    ]),
    slide('decision', 'Readiness questions', '#EAF4F0', [
      text('decision-kicker', '04 / BEFORE THE FIRST INVITATION', 40, 28, 710, 30, 13, '#347665', true),
      text('decision-title', 'Ready is a question.', 40, 72, 710, 62, 35, '#173E3B', true),
      ...[
        ['The offer is understandable.', 'Can a first-time visitor describe what they will make?'],
        ['The visit is practical.', 'Are location, materials, access and cancellation details clear?'],
        ['The evidence is honest.', 'Keep planned seats separate from bookings and attendance.'],
      ].flatMap(([title, body], index) => {
        const top = 162 + index * 76
        return [
          panel(`gate-${index}-mark`, 40, top + 7, 7, 42, ['#9B7BFF', '#F37B78', '#50C8B0'][index]),
          text(`gate-${index}-title`, title, 66, top, 676, 34, 21, '#173E3B', true),
          text(`gate-${index}-body`, body, 66, top + 37, 676, 35, 14, '#49645D'),
        ]
      }),
      text(
        'decision-footer',
        'Local demo only / No publication, approvals, tracking or messages',
        40,
        407,
        720,
        25,
        11,
        '#49645D',
      ),
    ]),
  ]
  return {
    id: CHILD_ID,
    name: 'Avenue / Campaign review',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: 'brief',
  }
}
