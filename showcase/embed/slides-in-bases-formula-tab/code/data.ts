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

export const HOST_ID = 'indigo-community-portfolio'
export const CHILD_ID = 'indigo-allocation-review'
export const SOURCE_NAME = 'Indigo Portfolio'
const table = '[Indigo Portfolio]!Projects'
const total = `SUM(${table}[Allocation])`
const largest = `MAX(${table}[Allocation])`
const projectAllocation = (project: string) => `SUMIF(${table}[Project],"${project}",${table}[Allocation])`
export const FORMULA_CARDS = [
  { page: 'overview', id: 'total', formula: '=' + total, format: '$#,##0' },
  { page: 'overview', id: 'count', formula: `=ROWS(${table}[Project])`, format: '0" projects"' },
  { page: 'overview', id: 'average', formula: `=${total}/ROWS(${table}[Project])`, format: '$#,##0' },
  ...['Neighbourhood library', 'Repair commons', 'Evening makers'].flatMap((name, i) => [
    { page: 'allocation', id: 'amount-' + i, formula: '=' + projectAllocation(name), format: '$#,##0' },
    { page: 'allocation', id: 'share-' + i, formula: '=' + projectAllocation(name) + '/' + total, format: '0.00%' },
  ]),
  { page: 'concentration', id: 'largest', formula: '=' + largest, format: '$#,##0' },
  { page: 'concentration', id: 'share', formula: '=' + largest + '/' + total, format: '0.00%' },
  {
    page: 'concentration',
    id: 'signal',
    formula: `=IF(${largest}/${total}>0.5,"Review concentration","No project above half")`,
    format: 'General',
  },
]
const TIME = Date.parse('2029-09-06T09:00:00Z')
export const PROJECTS = [
  ['Neighbourhood library', 'Learning', 15000, 'Mina', 'Portable shelves and a reading-room pilot.'],
  ['Repair commons', 'Making', 22000, 'Eli', 'Shared tools, bench access and volunteer training.'],
  ['Evening makers', 'Making', 8000, 'Rae', 'Three accessible evening workshops.'],
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
  size = 39,
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
          textStyle: { fs: size, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
        }),
        shapeType: ShapeTypeEnum.Rect,
        fill: { fillType: ShapeFillEnum.NoFill },
        stroke: { color: 'transparent', width: 0 },
      },
    },
  ]
}

export function createChildData(): ISlideData {
  const pages = [
    ['overview', 'Small places. Shared possibilities.', '#101A34', '#F5F7FF', '#58C8FF'],
    ['allocation', 'One portfolio. Three different commitments.', '#F5F2EA', '#22365F', '#4B68D9'],
    ['concentration', 'Watch the balance, not just the total.', '#173D3C', '#F5F7FF', '#50C8B0'],
  ].map(([id, title, bg, ink, accent], index) => {
    const elements = [
      text(id, 'kicker', 'INDIGO / COMMUNITY PROGRAMMES / ALLOCATION REVIEW', 48, 24, 1104, 28, 14, accent),
      text(id, 'title', title, 48, 78, 1104, 76, 35, ink),
      text(
        id,
        'footer',
        '0' + (index + 1) + ' / 03    Original fictional portfolio / USD planning amounts / Relational Table -> Slides',
        48,
        632,
        1104,
        24,
        12,
        accent,
      ),
    ]
    if (id === 'overview')
      elements.push(
        text(id, 'story', 'A place to read.\nA bench to repair.\nAn evening to make.', 48, 210, 535, 140, 26, ink),
        text(id, 'purpose', 'One source for every figure.\nNo copied totals.', 48, 375, 500, 70, 21, '#C8D0E4'),
        ...card(id, 'total', 'TOTAL ALLOCATION / Whole Relational Table', 640, 185, 510, '#DDE5FF', '#22365F', 48),
        ...card(id, 'count', 'SCOPE / All records', 640, 350, 510, '#BDEADE', '#234D43'),
        ...card(id, 'average', 'MEAN / Allocation per project', 48, 465, 510, '#E7DFF9', '#5B4678'),
      )
    if (id === 'allocation') {
      PROJECTS.forEach(([name, , , owner, note], i) => {
        const x = 48 + i * 376
        const fill = ['#DDE5FF', '#F5DFCA', '#DFEBE6'][i]
        const color = ['#344C91', '#86552D', '#315F50'][i]
        elements.push(
          text(id, 'name-' + i, name, x, 180, 350, 52, 23, color),
          ...card(id, 'amount-' + i, 'ALLOCATION / USD', x, 250, 350, fill, color),
          ...card(id, 'share-' + i, 'SHARE / Same live total', x, 414, 350, fill, color),
          text(id, 'owner-' + i, owner + ' / ' + note, x, 565, 350, 48, 13, ink),
        )
      })
    }
    if (id === 'concentration')
      elements.push(
        ...card(id, 'largest', 'LARGEST ALLOCATION / Native MAX', 48, 195, 510, '#E7DFF9', '#5B4678'),
        ...card(id, 'share', 'LARGEST / PORTFOLIO TOTAL', 640, 195, 510, '#F5DFCA', '#86552D'),
        ...card(
          id,
          'signal',
          'REVIEW PROMPT / Native IF, illustrative 50% threshold',
          48,
          385,
          1102,
          '#DDE5FF',
          '#344C91',
          34,
        ),
        text(
          id,
          'note',
          'A conversation prompt, not an approval rule. A zero total must show a native error.',
          48,
          560,
          1104,
          46,
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
        'Fictional community programmes. Amounts are planning allocations, not payments. Formula Shapes read the full Relational Table. Project labels, prose and geometry remain authored.',
    }
  })
  return {
    id: CHILD_ID,
    name: 'Indigo / Portfolio review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'overview',
  }
}

export function createHostData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Project', type: BaseFieldType.Text, config: {} },
    { id: 'allocation', name: 'Allocation', type: BaseFieldType.Number, config: { precision: 0 } },
    {
      id: 'programme',
      name: 'Programme',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Learning', name: 'Learning', color: '#6688FF' },
          { id: 'Making', name: 'Making', color: '#50C8B0' },
        ],
      },
    },
    { id: 'owner', name: 'Lead', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Context', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    PROJECTS.map(([title, programme, allocation, owner, note], i) => {
      const id = 'project-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, programme, allocation, owner, note },
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
    tableOrder: ['projects'],
    tables: {
      projects: {
        id: 'projects',
        name: 'Project register',
        formulaName: 'Projects',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['projects-grid'],
        views: {
          'projects-grid': {
            id: 'projects-grid',
            tableId: 'projects',
            name: 'Portfolio allocations',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 260 : id === 'note' ? 390 : id === 'allocation' ? 130 : 140,
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
