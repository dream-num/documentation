import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  SlidePageLayoutTypeEnum,
  SlidePageSizePresetEnum,
  type ISlideData,
  type ISlidePage,
  type ISlidePageElement,
  type ISlidePageSize,
} from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const WIDE = { width: 960, height: 540, preset: SlidePageSizePresetEnum.WideScreen16By9 }
export const VARIANTS = [
  { id: 'wide', label: 'Repair library · 16:9' },
  { id: 'standard', label: '4:3 · unchanged content' },
  { id: 'bounds', label: 'Boundary and rotated markers' },
  { id: 'empty', label: 'Zero pages' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
export const SIZES = {
  wide: '16:9 · 960 × 540',
  standard: '4:3 · 720 × 540',
  square: 'Square · 600 × 600',
  portrait: 'Portrait · 540 × 960',
  custom: 'Custom dimensions',
}
export function dimensions(kind: string, width = '800', height = '600'): ISlidePageSize {
  if (kind === 'wide') return { ...WIDE }
  if (kind === 'standard') return { width: 720, height: 540, preset: SlidePageSizePresetEnum.Standard4By3 }
  if (kind === 'square') return { width: 600, height: 600, preset: SlidePageSizePresetEnum.Custom }
  if (kind === 'portrait') return { width: 540, height: 960, preset: SlidePageSizePresetEnum.Custom }
  const w = Number(width),
    h = Number(height)
  if (kind !== 'custom' || ![w, h].every((n) => Number.isInteger(n) && n >= 120 && n <= 2400))
    throw new Error('Enter whole dimensions from 120 to 2400. No size was changed.')
  return { width: w, height: h, preset: SlidePageSizePresetEnum.Custom }
}
export const CONTENT = [
  [
    'opening',
    'Rivet / Repair library',
    'Sixty kits. One lending desk.',
    'Pilot briefing / 8 June 2027\nAll people and figures are fictional.',
    'Introduce a fictional lending service, not a real repair provider.',
    'title',
  ],
  [
    'purpose',
    'Keep useful things in use',
    '01 / Borrow the right kit',
    'Ask what needs repair.\nExplain when specialist help is needed.',
    'A program outline, not technical instructions for unsafe repairs.',
    'section',
  ],
  [
    'kits',
    'Sixty kits across four shelves',
    '18 drill / 16 sewing\n14 bicycle / 12 electronics',
    'Count kit inventory, not completed repairs.\nRecord each kit before lending.',
    '18 + 16 + 14 + 12 = 60 kits.',
    'content',
  ],
  [
    'workflow',
    'Two handoffs, one clear record',
    'BORROW / Check contents\nRETURN / Report missing pieces',
    'Lending lead / Em\nReturns lead / Dev',
    'Compare two responsibilities; both names are fictional.',
    'comparison',
  ],
  [
    'results',
    'Forty-eight tickets, three outcomes',
    '32 fixed / 10 awaiting parts / 6 referred',
    'Keep referred work in the record.\nDo not call every ticket a completed repair.',
    '32 + 10 + 6 = 48 tickets. The outcome data are fictional.',
    'data',
  ],
  [
    'quote',
    'A small repair, shared confidence',
    '“I knew which question\nto ask before borrowing.”',
    'Jo / fictional first-time borrower\nOriginal quotation for this fixture.',
    'The quote is authored, not a real customer endorsement.',
    'quote',
  ],
  [
    'rota',
    'Make the next shift predictable',
    'Four weekly sessions\nTwo desk hosts per session',
    'Keep the opening checklist visible.\nLeave a written handoff.',
    'Four sessions with two hosts each are eight assignments, not eight unique people.',
    'content',
  ],
  [
    'closing',
    'Leave the desk ready',
    'Next review / 15 June 2027',
    'Count returned kits. Review missing parts.\nOwner / Em, fictional lending lead.',
    'End with the next review and the person responsible.',
    'closing',
  ],
] as const
const rect = (left: number, top: number, width: number, height: number, rotation = 0) => ({
  left,
  top,
  width,
  height,
  rotation,
})
function text(
  id: string,
  value: string,
  transform: ReturnType<typeof rect>,
  fontSize: number,
  color: string,
): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform,
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: true,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
      shapeText: {
        isHorizontal: true,
        isRichText: false,
        text: value,
        fontFamily: 'Arial',
        fontSize,
        color,
        bold: id === 'title',
      },
    },
  }
}
function shape(id: string, transform: ReturnType<typeof rect>, color = '#CFE7EE'): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform,
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
export function createData(variant: Variant = 'wide'): ISlideData {
  const placements = {
    title: [rect(50, 70, 860, 90), rect(55, 225, 850, 80), rect(55, 350, 850, 100)],
    section: [rect(50, 85, 860, 95), rect(55, 235, 850, 70), rect(55, 345, 850, 100)],
    content: [rect(50, 40, 860, 90), rect(55, 175, 850, 120), rect(55, 335, 850, 100)],
    comparison: [rect(50, 40, 860, 90), rect(55, 190, 400, 210), rect(505, 220, 400, 170)],
    data: [rect(50, 40, 860, 90), rect(55, 195, 850, 110), rect(55, 350, 850, 95)],
    quote: [rect(50, 40, 860, 90), rect(95, 185, 770, 120), rect(95, 345, 770, 100)],
    closing: [rect(50, 60, 860, 90), rect(55, 210, 850, 90), rect(55, 345, 850, 100)],
  }
  const palettes = [
    { background: '#103D46', ink: '#FFF5E4', accent: '#F29B82' },
    { background: '#FFF3DF', ink: '#163F45', accent: '#B55038' },
    { background: '#D8EBDD', ink: '#143F3D', accent: '#955036' },
    { background: '#F2B5A0', ink: '#153F45', accent: '#215F62' },
    { background: '#153F45', ink: '#FFF3DF', accent: '#ABD8C0' },
    { background: '#FFF3DF', ink: '#163F45', accent: '#AD4F36' },
    { background: '#D8EBDD', ink: '#143F3D', accent: '#99513C' },
    { background: '#245A5A', ink: '#FFF3DF', accent: '#F2B5A0' },
  ]
  const pages = (variant === 'empty' ? [] : CONTENT).map(([id, title, first, second, notes, layout], index) => {
    const [a, b, c] = placements[layout]
    const palette = palettes[index]
    const elements = [
      shape('panel', rect(55, 155, 115, 5), palette.accent),
      text('title', title, a, 32, palette.ink),
      text('first', first, b, 26, palette.accent),
      text('second', second, c, 24, palette.ink),
    ]
    if (variant === 'bounds' && id === 'opening')
      elements.push(
        shape('outside-left', rect(-12, 260, 36, 24), '#C45737'),
        shape('outside-right', rect(944, 260, 36, 24), '#C45737'),
        shape('outside-bottom', rect(440, 525, 36, 30), '#C45737'),
        shape('touching-edge', rect(924, 516, 36, 24), '#237C60'),
        shape('rotated-left', rect(0, 120, 80, 80, 45), '#C45737'),
      )
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      masterPageId: 'rivet-master',
      layoutPageId: layout,
      showMasterSp: true,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: palette.background },
      speakerNotes: notes,
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      elementOrder: elements.map((element) => element.id),
    }
  })
  return {
    id: 'rivet-deck',
    name: 'Rivet / Repair library',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: variant === 'standard' ? dimensions('standard') : { ...WIDE },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: pages[0]?.id,
    masterPages: {
      'rivet-master': {
        id: 'rivet-master',
        name: 'Inherited rule',
        pageType: PageTypeEnum.Master,
        pageSize: { ...WIDE },
        background: { type: SlideBackgroundTypeEnum.Solid, color: '#F7FAFC' },
        elements: { 'master-rule': shape('master-rule', rect(0, 525, 960, 6), '#1F6378') },
        elementOrder: ['master-rule'],
      },
    },
    masterPageOrder: ['rivet-master'],
    layoutPages: Object.fromEntries(
      Object.keys(placements).map((id) => [
        id,
        {
          id,
          name: id,
          pageType: PageTypeEnum.Layout,
          layoutType: SlidePageLayoutTypeEnum.Custom,
          masterPageId: 'rivet-master',
          elements: {},
          elementOrder: [],
        },
      ]),
    ),
    layoutPageOrder: Object.keys(placements),
  }
}

// ponytail: scale this authored plain-text gallery only; rich-text edits need a document-aware scaler.
export function scaleElements(page: ISlidePage, from: ISlidePageSize, to: ISlidePageSize) {
  if (![from.width, from.height, to.width, to.height].every((n) => Number.isFinite(n) && n > 0))
    throw new Error('Invalid source or target dimensions.')
  const factor = Math.min(to.width / from.width, to.height / from.height),
    dx = (to.width - from.width * factor) / 2,
    dy = (to.height - from.height * factor) / 2
  const elements = Object.values(page.elements).map((element) => {
    if (element.type !== PageElementTypeEnum.Text && element.type !== PageElementTypeEnum.Shape)
      throw new Error('Scale supports this fixture’s plain text and simple shapes only. No page was changed.')
    if (element.type === PageElementTypeEnum.Text && (element.textData || !element.textStyle?.fontSize))
      throw new Error('Rich-text edits need a document-aware scaler. Reload the original fixture first.')
    if (element.type === PageElementTypeEnum.Shape && element.shapeData.shapeText) {
      const label = element.shapeData.shapeText
      if (
        ('dataModel' in label && label.dataModel?.doc) ||
        !('isRichText' in label) ||
        label.isRichText !== false ||
        !label.fontSize
      )
        throw new Error('Rich shape text needs a document-aware scaler. No page was changed.')
    }
    const copy = structuredClone(element),
      transform = copy.transform
    if (
      ![transform.left, transform.top, transform.width, transform.height].every(
        (n) => typeof n === 'number' && Number.isFinite(n),
      )
    )
      throw new Error('An element has incomplete geometry. No page was changed.')
    transform.left = transform.left! * factor + dx
    transform.top = transform.top! * factor + dy
    transform.width = transform.width! * factor
    transform.height = transform.height! * factor
    if (copy.type === PageElementTypeEnum.Text) copy.textStyle!.fontSize! *= factor
    if (copy.type === PageElementTypeEnum.Shape && copy.shapeData.shapeText && 'fontSize' in copy.shapeData.shapeText)
      copy.shapeData.shapeText.fontSize! *= factor
    return copy
  })
  return { factor, elements }
}
// Separate authored slides expose size differences without a fixture selector.
export function createGalleryData(): ISlideData {
  const data = createData('bounds')
  for (const [id, size] of [
    ['purpose', dimensions('standard')],
    ['kits', dimensions('square')],
    ['workflow', dimensions('portrait')],
    ['results', dimensions('standard')],
  ] as const) {
    const page = data.slides[id]
    page.pageSize = size
    if (id === 'workflow' || id === 'results') {
      page.elements = Object.fromEntries(
        scaleElements(page, WIDE, size).elements.map((element) => [element.id, element]),
      )
    }
  }
  data.slides.purpose.name = '02 / 4:3 - unchanged content'
  data.slides.kits.name = '03 / Square - unchanged content'
  data.slides.workflow.name = '04 / Portrait - scaled content'
  data.slides.results.name = '05 / 4:3 - scaled content'
  return data
}

export function overflow(bounds: { left: number; top: number; right: number; bottom: number }, size: ISlidePageSize) {
  const epsilon = 0.01
  return [
    bounds.left < -epsilon && 'left',
    bounds.top < -epsilon && 'top',
    bounds.right > size.width + epsilon && 'right',
    bounds.bottom > size.height + epsilon && 'bottom',
  ].filter(Boolean) as string[]
}
