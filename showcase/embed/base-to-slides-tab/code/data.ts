import type { IBaseSnapshot } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
  RichTextBuilder,
} from '@univerjs/core'
export const HOST_ID = 'violet-editorial-deck'
export const CHILD_ID = 'violet-editorial-register'
export const SOURCE_NAME = 'Violet Editorial'
const table = '[Violet Editorial]!Pieces'
const ready = `COUNTIF(${table}[Status],"Ready")`
const total = `COUNTA(${table}[Piece])`
const readyWords = `SUMIF(${table}[Status],"Ready",${table}[Words])`
export const FORMULA_CARDS = [
  { page: 'overview', id: 'ready', formula: '=' + ready, format: '0" ready"' },
  { page: 'overview', id: 'total', formula: '=' + total, format: '0" pieces"' },
  { page: 'overview', id: 'count-rate', formula: '=' + ready + '/' + total, format: '0.00%' },
  { page: 'overview', id: 'word-rate', formula: '=' + readyWords + `/SUM(${table}[Words])`, format: '0.00%' },
  ...['Guides', 'Essays', 'Interviews'].flatMap((section) => [
    {
      page: 'sections',
      id: section.toLowerCase() + '-ready',
      formula: `=SUMIFS(${table}[Words],${table}[Status],"Ready",${table}[Section],"${section}")`,
      format: '#,##0" words"',
    },
    {
      page: 'sections',
      id: section.toLowerCase() + '-total',
      formula: `=SUMIF(${table}[Section],"${section}",${table}[Words])`,
      format: '#,##0" words"',
    },
  ]),
  { page: 'decision', id: 'ready-repeat', formula: '=' + ready, format: '0" ready"' },
  {
    page: 'decision',
    id: 'unfinished',
    formula: `=SUMIF(${table}[Status],"<>Ready",${table}[Words])`,
    format: '#,##0" words"',
  },
  {
    page: 'decision',
    id: 'signal',
    formula: `=IF(COUNTIF(${table}[Status],"Blocked")>0,"Resolve blockers","Review the mix")`,
    format: 'General',
  },
]
const TIME = Date.parse('2029-11-05T09:00:00Z')
export const PIECES = [
  ['A quieter morning', 'Guides', 'Ready', 900, 'Ada', 'Illustrate the three-step routine.'],
  ['Repair a favourite cup', 'Guides', 'Ready', 600, 'Noah', 'Retain the repair disclaimer.'],
  ['The city after rain', 'Essays', 'Ready', 1400, 'Sana', 'Opening quotation approved.'],
  ['Inside the community kiln', 'Interviews', 'Ready', 1100, 'Jules', 'Transcript checked by the guest.'],
  ['Five windowsill herbs', 'Guides', 'Ready', 400, 'Mika', 'Keep the compact checklist.'],
  ['The value of a slow route', 'Essays', 'Review', 1800, 'Remy', 'Review the final two paragraphs.'],
  ['A library of useful objects', 'Interviews', 'Blocked', 1200, 'Inez', 'Await a replacement photograph.'],
  ['A weekend without waste', 'Guides', 'Draft', 800, 'Theo', 'Replace the placeholder ending.'],
] as const
function text(
  page: string,
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
) {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize: size, color, bold: id === 'title' })
    .getData()
  doc.id = page + '-' + id
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = doc.id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = doc.id + '-s-' + i
  })
  return {
    id,
    type: PageElementTypeEnum.Shape as const,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function card(
  page: string,
  id: string,
  label: string,
  left: number,
  top: number,
  width: number,
  fill: string,
  ink: string,
) {
  const spec = FORMULA_CARDS.find((c) => c.page === page && c.id === id)!
  return [
    text(page, id + '-panel', '', left, top, width, 142, 14, ink, fill),
    text(page, id + '-label', label, left + 20, top + 15, width - 40, 28, 16, ink),
    {
      id,
      type: PageElementTypeEnum.Shape as const,
      transform: { left: left + 18, top: top + 54, width: width - 36, height: 68, rotation: 0 },
      shapeData: {
        ...createFormulaShapeData({
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          numberFormatPattern: spec.format,
          textStyle: { fs: 39, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
        }),
        shapeType: ShapeTypeEnum.Rect,
        fill: { fillType: ShapeFillEnum.NoFill },
        stroke: { color: 'transparent', width: 0 },
      },
    },
  ]
}

export function createHostData(): ISlideData {
  const pages = [
    ['overview', 'Ready to publish is not one percentage.', '#27243C', '#FFF8F0', '#C7B4F5'],
    ['sections', 'Three sections. Different editorial weight.', '#F8F1E7', '#263B3B', '#417B6D'],
    ['decision', 'Use the numbers to choose a conversation.', '#174B49', '#F4FAEE', '#A8DACE'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      text(id, 'kicker', 'VIOLET / SLOW LIVING JOURNAL / EDITORIAL REVIEW', 40, 24, 1120, 28, 14, accent),
      text(id, 'title', title, 40, 78, 1120, 70, 35, ink),
      text(
        id,
        'footer',
        'Original fictional issue / Open Editorial data / Base -> Slides, no publishing or backend',
        40,
        635,
        1120,
        24,
        12,
        accent,
      ),
    ]
    if (id === 'overview')
      elements.push(
        ...card(id, 'ready', 'READY / Status-based count', 40, 195, 535, '#E6DEF6', '#5A4676'),
        ...card(id, 'total', 'ALL PIECES / Whole-table count', 625, 195, 535, '#DFEEE6', '#285D50'),
        ...card(id, 'count-rate', 'READY PIECES / ALL PIECES', 40, 375, 535, '#DDE9F5', '#2D486A'),
        ...card(id, 'word-rate', 'READY WORDS / ALL WORDS', 625, 375, 535, '#F5DFCC', '#855237'),
        text(
          id,
          'explain',
          'Five short or long pieces can be ready. Counts and word-weighted coverage tell different stories.',
          40,
          555,
          1120,
          52,
          21,
          ink,
        ),
      )
    if (id === 'sections')
      ['Guides', 'Essays', 'Interviews'].forEach((name, i) => {
        const fill = ['#DFEEE6', '#F5DFCC', '#E6DEF6'][i],
          color = ['#285D50', '#855237', '#5A4676'][i]
        elements.push(
          ...card(
            id,
            name.toLowerCase() + '-ready',
            name.toUpperCase() + ' / Ready words',
            40 + i * 385,
            205,
            350,
            fill,
            color,
          ),
          ...card(id, name.toLowerCase() + '-total', 'ALL WORDS / Same section', 40 + i * 385, 390, 350, fill, color),
        )
      })
    if (id === 'decision')
      elements.push(
        ...card(id, 'ready-repeat', 'ONE SOURCE / Repeated live count', 40, 190, 535, '#E6DEF6', '#5A4676'),
        ...card(id, 'unfinished', 'NOT READY / Retained words', 625, 190, 535, '#F5DFCC', '#855237'),
        ...card(id, 'signal', 'NEXT CONVERSATION / Native IF', 40, 390, 1120, '#DFEEE6', '#285D50'),
        text(
          id,
          'explain',
          'A filtered table view is a reading aid, not a change to the formula source.',
          40,
          565,
          1120,
          40,
          21,
          ink,
        ),
      )
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Original fictional journal. Live native formulas read the full Base table; no article is published. Narrative and geometry remain authored.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Violet / Editorial review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'overview',
  }
}
export function createChildData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Piece', type: BaseFieldType.Text, config: {} },
    { id: 'section', name: 'Section', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Draft', name: 'Draft', color: '#688DAC' },
          { id: 'Review', name: 'Review', color: '#A08AB8' },
          { id: 'Blocked', name: 'Blocked', color: '#BD7A5D' },
          { id: 'Ready', name: 'Ready', color: '#719884' },
        ],
      },
    },
    { id: 'words', name: 'Words', type: BaseFieldType.Number, config: {} },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Next step', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    PIECES.map(([title, section, status, words, owner, note], i) => {
      const id = 'piece-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, section, status, words, owner, note },
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
    tableOrder: ['pieces'],
    tables: {
      pieces: {
        id: 'pieces',
        name: 'Pieces',
        formulaName: 'Pieces',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['pieces-grid'],
        views: {
          'pieces-grid': {
            id: 'pieces-grid',
            tableId: 'pieces',
            name: 'Editorial register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 215 : id === 'note' ? 300 : id === 'words' ? 90 : 115,
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
