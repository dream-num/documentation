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

export const HOST_ID = 'solstice-delivery-review'
export const CHILD_ID = 'solstice-supplier-readiness'
export const PAGE_ID = 'readiness'
const REVIEW_TIME = Date.parse('2027-06-17T09:00:00Z')

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
      'Original fictional reading-light release. Narrative slides are not live Formula Shapes. No supplier messages, orders or approvals are sent.',
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
        name: id === 'checks' ? 'Delivery review' : 'Supplier directory',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 205 : fieldId === 'next' ? 280 : fieldId === 'supplier' ? 155 : 112,
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
    slide(PAGE_ID, 'Delivery readiness', '#F8F4EB', [
      text('kicker', 'SOLSTICE / PORTABLE READING LIGHT / 17 JUNE 2027', 40, 32, 915, 30, 14, '#65517E', true),
      text('title', 'Evidence before the first delivery.', 40, 76, 920, 56, 34, '#332B46', true),
      panel('side', 32, 180, 230, 390, '#49385F'),
      text('side-number', '07', 54, 205, 184, 85, 62, '#F4D67D', true),
      text('side-label', 'checks\n3 suppliers', 54, 312, 186, 88, 18, '#FFF5DD', true),
      text('side-note', 'Review locally.\nNo approvals\nare sent.', 54, 438, 190, 110, 17, '#E0D8EA'),
      text(
        'footer',
        'Double-click the floating register to edit. Scroll inside it to inspect owners, dates and evidence.',
        40,
        593,
        915,
        42,
        16,
        '#65517E',
      ),
    ]),
    slide('quality', 'Three handoffs, different risks', '#DAE8ED', [
      text('quality-kicker', '02 / QUALITY HANDOFFS', 42, 34, 900, 30, 14, '#3A5969', true),
      text('quality-title', 'Different parts. Different evidence.', 42, 93, 910, 66, 36, '#263C49', true),
      panel('shell-card', 42, 210, 280, 235, '#F8F4EB'),
      panel('power-card', 360, 210, 280, 235, '#EFE0B3'),
      panel('pack-card', 678, 210, 280, 235, '#DFD3E8'),
      text('shell-name', '01 / ENCLOSURE', 62, 235, 240, 35, 20, '#49385F', true),
      text('shell-note', 'Latch cycle\nEdge finish\nRetained sample', 62, 300, 240, 125, 20, '#49385F'),
      text('power-name', '02 / POWER', 380, 235, 240, 35, 20, '#635020', true),
      text(
        'power-note',
        'Batch label\nRuntime test\nTest conditions',
        380,
        300,
        240,
        125,
        20,
        '#635020',
      ),
      text('pack-name', '03 / PACKAGING', 698, 235, 240, 35, 20, '#49385F', true),
      text(
        'pack-note',
        'Large type\nRecycled stock\nUnboxing trial',
        698,
        300,
        240,
        125,
        20,
        '#49385F',
      ),
      text(
        'quality-footer',
        'Authored prompts, not live calculations or a safety certification.',
        42,
        510,
        916,
        64,
        19,
        '#3A5969',
      ),
    ]),
    slide('decision', 'A clear release boundary', '#49385F', [
      text('decision-kicker', '03 / REVIEW BOUNDARY', 42, 34, 915, 30, 14, '#F4D67D', true),
      text('decision-title', 'Keep uncertainty visible.', 42, 109, 915, 80, 42, '#FFF5DD', true),
      text('decision-review', 'REVIEW / Label legibility and enclosure finish.', 58, 254, 890, 56, 26, '#FFF5DD'),
      text('decision-hold', 'HOLD / Battery trace and carton drop evidence.', 58, 353, 890, 56, 26, '#F4D67D'),
      text('decision-ready', 'READY / Record what was checked, by whom and when.', 58, 452, 890, 70, 25, '#DAE8ED'),
      text(
        'decision-footer',
        'Local fictional data only. Changing a status never releases a purchase order or sends an approval.',
        42,
        555,
        915,
        42,
        15,
        '#E0D8EA',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Solstice / Supplier delivery readiness',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 650 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

export function createChildData(): IBaseSnapshot {
  const suppliers = table(
    'suppliers',
    'Suppliers',
    [
      field('title', 'Supplier', BaseFieldType.Text),
      field('part', 'Part family', BaseFieldType.Text),
      field('contact', 'Review owner', BaseFieldType.Text),
    ],
    [
      { title: 'Alder Moulding', part: 'Enclosure', contact: 'June Park' },
      { title: 'Lumen Cells', part: 'Power module', contact: 'Sam Vale' },
      { title: 'Paperloop', part: 'Printed pack', contact: 'Amira Chen' },
    ],
  )
  const items = [
    ['Enclosure finish', 1, 'review', 'June', 0, 12, 'Inspect six matte and six gloss samples under the same light.'],
    ['Battery batch trace', 2, 'blocked', 'Sam', -2, 8, 'Lot identifier is missing from the received test sheet.'],
    ['Large-type insert', 3, 'review', 'Amira', 1, 15, 'Compare the 14 pt proof with the existing 10 pt version.'],
    ['Latch cycle sample', 1, 'ready', 'June', -1, 3, 'Three retained samples completed the agreed rehearsal.'],
    ['Runtime log', 2, 'ready', 'Sam', 0, 6, 'Six logs include brightness level and test conditions.'],
    ['Carton drop record', 3, 'blocked', 'Amira', 2, 4, 'Await photographs of the final packed configuration.'],
    [
      'Recycled stock note',
      3,
      'ready',
      'Amira',
      -3,
      2,
      'Two stock declarations are attached to the local review notes.',
    ],
  ] as const
  const checks = table(
    'checks',
    'Checks',
    [
      field('title', 'Release check', BaseFieldType.Text),
      field('state', 'State', BaseFieldType.SingleSelect, {
        options: [
          { id: 'ready', name: 'Ready', color: '#528375' },
          { id: 'review', name: 'In review', color: '#AE8939' },
          { id: 'blocked', name: 'Blocked', color: '#945770' },
        ],
      }),
      field('supplier', 'Supplier', BaseFieldType.RecordLink, {
        targetTableId: 'suppliers',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('due', 'Review date', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false }),
      field('samples', 'Samples', BaseFieldType.Number),
      field('next', 'Evidence / next step', BaseFieldType.Text),
    ],
    items.map(([title, supplier, state, owner, day, samples, next]) => ({
      title,
      supplier: serializeRecordLinkIds([`suppliers-${supplier}`]),
      state,
      owner,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
      samples,
      next,
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Solstice / Supplier readiness',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['checks', 'suppliers'],
    tables: { checks, suppliers },
  }
}
