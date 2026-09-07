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
export const HOST_ID = 'orchid-pipeline-deck'
export const CHILD_ID = 'orchid-opportunity-register'
export const SOURCE_NAME = 'Orchid Pipeline'
export const PAGE_ID = 'pipeline'
const table = '[Orchid Pipeline]!Deals'
const nominal = `SUM(${table}[Amount])`
const weighted = `SUMPRODUCT(${table}[Amount],${table}[Probability])`
export const FORMULA_CARDS = [
  { page: 'pipeline', id: 'nominal', formula: '=' + nominal, format: '$#,##0' },
  { page: 'pipeline', id: 'weighted', formula: '=' + weighted, format: '$#,##0' },
  { page: 'forecast', id: 'nominal', formula: '=' + nominal, format: '$#,##0' },
  { page: 'forecast', id: 'weighted', formula: '=' + weighted, format: '$#,##0' },
  { page: 'forecast', id: 'coverage', formula: '=' + weighted + '/' + nominal, format: '0.00%' },
  { page: 'forecast', id: 'gap', formula: '=' + nominal + '-' + weighted, format: '$#,##0' },
  ...['Discovery', 'Proposal', 'Negotiation'].map((stage) => ({
    page: 'review',
    id: stage.toLowerCase(),
    formula: `=SUMIF(${table}[Stage],"${stage}",${table}[Amount])`,
    format: '$#,##0',
  })),
  { page: 'review', id: 'active', formula: `=COUNTIF(${table}[Probability],">0")`, format: '0" active"' },
  { page: 'review', id: 'weighted', formula: '=' + weighted, format: '$#,##0' },
  {
    page: 'review',
    id: 'signal',
    formula: '=IF(' + weighted + '>=30000,"Coverage improved","Develop the pipeline")',
    format: 'General',
  },
]
const TIME = Date.parse('2029-12-03T09:00:00Z')
export const DEALS = [
  ['Museum after dark', 'Negotiation', 24000, 0.5, 'Leah', 'Confirm the installation window.'],
  ['Library listening room', 'Proposal', 18000, 0.5, 'Omar', 'Revise the acoustic package.'],
  ['Arts centre wayfinding', 'Discovery', 10000, 0.4, 'Nia', 'Walk the visitor journey.'],
  ['Harbour heritage trail', 'Discovery', 8000, 0, 'Ezra', 'Scope the outdoor materials.'],
  ['Botanical sound garden', 'Proposal', 14000, 0, 'Ruth', 'Await the site survey.'],
  ['Community theatre foyer', 'Negotiation', 6000, 0, 'Jae', 'Clarify the opening date.'],
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
          textStyle: { fs: id === 'signal' ? 24 : 39, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
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
    ['pipeline', 'Every forecast starts with a conversation.', '#172629', '#F6F1DF', '#D4B961'],
    ['forecast', 'Face value is not expected value.', '#F6F1DF', '#243C3A', '#86703A'],
    ['review', 'Stage and probability answer different questions.', '#44304E', '#FBF2E9', '#DCB8D4'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      text(id, 'kicker', 'ORCHID / EXPERIENCE DESIGN STUDIO / DECEMBER PIPELINE', 40, 24, 1120, 28, 14, accent),
      text(id, 'title', title, 40, 76, 1120, 70, 34, ink),
      text(
        id,
        'footer',
        'Original fictional opportunities / Base -> Slides / Illustrative assumptions, not booked revenue',
        40,
        639,
        1120,
        24,
        12,
        accent,
      ),
    ]
    if (id === 'pipeline')
      elements.push(
        ...card(id, 'nominal', 'FACE VALUE', 40, 195, 270, '#EADDC0', '#574821'),
        ...card(id, 'weighted', 'WEIGHTED VALUE', 40, 385, 270, '#D5E8DF', '#285C51'),
        text(id, 'source-label', 'NATIVE BASE / Edit the opportunity register', 350, 148, 810, 28, 15, accent),
      )
    if (id === 'forecast')
      elements.push(
        ...card(id, 'nominal', 'NOMINAL / Whole-table amount', 40, 195, 535, '#EADDC0', '#574821'),
        ...card(id, 'weighted', 'EXPECTED / SUMPRODUCT', 625, 195, 535, '#D5E8DF', '#285C51'),
        ...card(id, 'coverage', 'WEIGHTED / NOMINAL', 40, 375, 535, '#E4D9EB', '#614369'),
        ...card(id, 'gap', 'UNWEIGHTED / Remaining exposure', 625, 375, 535, '#F0D5C5', '#85513C'),
        text(
          id,
          'explain',
          'One probability edit changes expected value, not face value. A zero-probability deal still has an amount.',
          40,
          555,
          1120,
          58,
          21,
          ink,
        ),
      )
    if (id === 'review') {
      for (const [i, stage] of ['Discovery', 'Proposal', 'Negotiation'].entries())
        elements.push(
          ...card(
            id,
            stage.toLowerCase(),
            stage.toUpperCase() + ' / Face value',
            40 + i * 385,
            195,
            350,
            ['#D5E8DF', '#EADDC0', '#E4D9EB'][i],
            ['#285C51', '#574821', '#614369'][i],
          ),
        )
      elements.push(
        ...card(id, 'active', 'NON-ZERO / Probability count', 40, 380, 350, '#D5E8DF', '#285C51'),
        ...card(id, 'weighted', 'REPEATED / Weighted', 425, 380, 350, '#EADDC0', '#574821'),
        ...card(id, 'signal', 'REVIEW / Native IF threshold', 810, 380, 350, '#E4D9EB', '#614369'),
        text(
          id,
          'explain',
          'Stage does not set probability. Change either field and compare its dependent results.',
          40,
          555,
          1120,
          58,
          21,
          ink,
        ),
      )
    }
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Original fictional studio. Probabilities are manually entered assumptions. Native formulas read the complete Base table, not only a filtered view.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Orchid / Pipeline review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: PAGE_ID,
  }
}
export function createChildData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Opportunity', type: BaseFieldType.Text, config: {} },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: {} },
    { id: 'probability', name: 'Probability', type: BaseFieldType.Number, config: {} },
    {
      id: 'stage',
      name: 'Stage',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Discovery', name: 'Discovery', color: '#80A99B' },
          { id: 'Proposal', name: 'Proposal', color: '#B99B53' },
          { id: 'Negotiation', name: 'Negotiation', color: '#AA8CBA' },
        ],
      },
    },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Next step', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    DEALS.map(([title, stage, amount, probability, owner, note], i) => {
      const id = 'deal-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, stage, amount, probability, owner, note },
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
    tableOrder: ['deals'],
    tables: {
      deals: {
        id: 'deals',
        name: 'Deals',
        formulaName: 'Deals',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['deals-grid'],
        views: {
          'deals-grid': {
            id: 'deals-grid',
            tableId: 'deals',
            name: 'Opportunity register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'title' ? 235 : id === 'note' ? 300 : 140 },
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
