import type { ISlideData, ISlidePage, ISlidePageElement } from '@univerjs-pro/slides'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum } from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize = 24,
  color = '#111A2E',
  bold = false,
): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: true,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
      shapeText: { isHorizontal: true, isRichText: false, text: value, fontFamily: 'Arial', fontSize, color, bold },
    },
  }
}
function panel(id: string, left: number, top: number, width: number, height: number, color: string): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.RoundRect,
      adjustValues: { adj: 6500 },
      fill: { color },
      stroke: { color, width: 0 },
    },
  }
}
function metric(id: string, value: string, left: number, color: string) {
  return [
    panel(id + '-background', left, 255, 246, 190, color),
    text(id, value, left + 10, 285, 226, 140, 21, '#111A2E', true),
  ]
}
function slide(
  id: string,
  title: string,
  color: string,
  notes: string,
  body: ISlidePageElement[],
  dark = false,
): ISlidePage {
  const elements = [
    text('eyebrow', 'NORTHSTAR / FY2027 Q2 / LEADERSHIP REVIEW', 60, 38, 1080, 25, 15, dark ? '#58C8FF' : '#4F8095'),
    text('title', title, 60, 88, 1080, 110, 40, dark ? '#F5F7FF' : '#111A2E', true),
    ...body,
    text(
      'footer',
      'Original fictional business data / USD millions / 30 June 2027',
      60,
      615,
      1080,
      28,
      15,
      dark ? '#C8D0E4' : '#536078',
    ),
  ]
  return {
    id,
    name: title,
    pageType: PageTypeEnum.Slide,
    background: { type: SlideBackgroundTypeEnum.Solid, color },
    speakerNotes: notes,
    elementOrder: elements.map((element) => element.id),
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
  }
}
const pages = [
  slide(
    'scorecard',
    'A resilient quarter. A gap to close.',
    '#101A34',
    'Actual revenue is $43.8M against a $45.0M target: a $1.2M shortfall. Raising the target to $46.5M changes the gap to $2.7M; edit both authored labels explicitly. This deck is not formula-linked.',
    [
      text('subtitle', 'Revenue, retention and pipeline / FY2027 Q2', 60, 196, 1080, 36, 23, '#C8D0E4'),
      ...metric('target', '$45.0M\nRevenue target', 60, '#DDE5FF'),
      ...metric('actual', '$43.8M\nRevenue actual', 338, '#DDF3ED'),
      ...metric('retention', '94.2%\nGross retention', 616, '#EAE2FF'),
      ...metric('pipeline', '$61.4M\nQualified\npipeline', 894, '#FBECCB'),
      text('gap', 'Target gap: $1.2M', 60, 482, 1080, 45, 30, '#F2B84B', true),
      text(
        'interpretation',
        'Protect renewals first. Convert the right pipeline next.',
        60,
        546,
        1080,
        40,
        23,
        '#F5F7FF',
      ),
    ],
    true,
  ),
  slide(
    'regions',
    'Regional performance',
    '#F5F7FF',
    'North America 18.7, EMEA 11.3, APAC 8.6 and LATAM 5.2 total $43.8M. Bars are authored shapes, not live charts.',
    [
      text('regional-total', '$43.8M / four markets', 60, 194, 1080, 40, 25),
      ...[
        ['north-america', 'North America', '18.7', 640, '#6688FF'],
        ['emea', 'EMEA', '11.3', 387, '#50C8B0'],
        ['apac', 'APAC', '8.6', 294, '#9B7BFF'],
        ['latam', 'LATAM', '5.2', 178, '#D98C5F'],
      ].flatMap(([id, label, value, width, color], index) => [
        text(String(id), String(label), 60, 267 + index * 70, 220, 40, 25),
        panel(id + '-bar', 300, 264 + index * 70, Number(width), 42, String(color)),
        text(id + '-value', '$' + value + 'M', 970, 267 + index * 70, 170, 40, 25),
      ]),
      text(
        'bar-note',
        'Authored comparison bars / labels and geometry are edited independently.',
        60,
        564,
        1080,
        36,
        18,
        '#536078',
      ),
    ],
  ),
  slide(
    'drivers',
    'Understand the revenue movement',
    '#FFF8ED',
    'Previous-quarter revenue 40.8 plus expansion 2.4 plus new customers 1.8 less contraction 1.2 equals 43.8. Quarter-on-quarter movement is distinct from the target gap.',
    [
      text('bridge', '$40.8M previous quarter  →  $43.8M this quarter', 60, 201, 1080, 55, 30),
      panel('expansion-bg', 60, 292, 340, 235, '#DDF3ED'),
      panel('new-bg', 430, 292, 340, 235, '#DDE5FF'),
      panel('contraction-bg', 800, 292, 340, 235, '#F8DAD8'),
      text('expansion', '+$2.4M\nExpansion\nExisting\ncustomers', 85, 324, 290, 180, 29),
      text('new', '+$1.8M\nNew customers\nFirst contracts', 455, 324, 290, 180, 29),
      text('contraction', '−$1.2M\nContraction\nRenewal\nreductions', 825, 324, 290, 180, 29),
    ],
  ),
  slide(
    'customers',
    'Retention deserves operating attention.',
    '#173B3A',
    'Gross retention is an authored KPI. Three renewal blockers and four onboarding risks are separate fictional work queues, not inputs to the retention calculation.',
    [
      text('retention-large', '94.2%', 60, 235, 530, 155, 100, '#F5F7FF', true),
      text('retention-label', 'Gross retention / protect the base', 60, 410, 500, 70, 25, '#C8D0E4'),
      panel('renewals-bg', 650, 230, 490, 145, '#DDF3ED'),
      text('renewals', '3 renewal blockers\nMira / agree recovery plans', 678, 258, 430, 110, 27),
      panel('onboarding-bg', 650, 405, 490, 145, '#FBECCB'),
      text('onboarding', '4 onboarding risks\nTheo / focus\nadoption support', 678, 433, 430, 110, 27),
    ],
    true,
  ),
  slide(
    'pipeline-review',
    'Pipeline is potential, not booked revenue.',
    '#F5F7FF',
    'Discovery 24.2, proposal 22.6 and negotiation 14.6 sum to $61.4M. These authored bands are not a weighted forecast or a native Chart.',
    [
      text('pipeline-total', '$61.4M / qualified pipeline', 60, 210, 1080, 65, 36, '#4B68D9', true),
      panel('discovery-bg', 60, 325, 426, 80, '#6688FF'),
      panel('proposal-bg', 486, 325, 398, 80, '#50C8B0'),
      panel('negotiation-bg', 884, 325, 256, 80, '#B6A6FF'),
      text('discovery', 'Discovery\n$24.2M', 60, 440, 350, 95, 28),
      text('proposal', 'Proposal\n$22.6M', 486, 440, 350, 95, 28),
      text('negotiation', 'Negotiation\n$14.6M', 884, 440, 256, 95, 28),
    ],
  ),
  slide(
    'execution',
    'Turn the review into a working rhythm.',
    '#101A34',
    'These are proposed next-quarter milestones, not completed work. Owners are fictional. Use native text editing to revise dates and commitments.',
    [
      ['15 JUL', 'Mira', 'Renewal desk'],
      ['12 AUG', 'Theo', 'Adoption check'],
      ['09 SEP', 'Amina', 'Pipeline review'],
    ].flatMap(([date, owner, task], index) => [
      panel('milestone-bg-' + index, 60 + index * 370, 260, 340, 270, ['#DDE5FF', '#DDF3ED', '#EAE2FF'][index]),
      text('milestone-' + index, date + '\n' + owner + '\n' + task, 85 + index * 370, 302, 290, 195, 31),
    ]),
    true,
  ),
  slide(
    'risks',
    'Two risks that need different responses.',
    '#FFF8ED',
    'Qualitative risks, not computed risk scores. Capacity and deal concentration have different owners and mitigations.',
    [
      panel('capacity-bg', 60, 240, 520, 320, '#FBECCB'),
      text(
        'capacity',
        'CAPACITY\n2 specialist vacancies\n\nTheo / sequence onboarding\nbefore taking on more work.',
        88,
        270,
        460,
        265,
        27,
      ),
      panel('concentration-bg', 620, 240, 520, 320, '#EAE2FF'),
      text(
        'concentration',
        'DEAL CONCENTRATION\nA small set of\nlarge proposals\n\nAmina / requalify milestones\nand test timing assumptions.',
        648,
        270,
        460,
        265,
        27,
      ),
    ],
  ),
  slide(
    'decision',
    'Decide what we will protect.',
    '#173B3A',
    'Decision owner: Rowan. Record rationale in the native Speaker notes panel. This is an authored leadership proposal, not an automated approval workflow.',
    [
      text(
        'decisions',
        '01   Protect the renewal programme\n\n02   Fund targeted onboarding coverage\n\n03   Requalify before increasing the forecast',
        60,
        230,
        1080,
        295,
        32,
        '#F5F7FF',
      ),
      text('owner', 'Rowan / decision owner / capture rationale in Speaker notes', 60, 558, 1080, 40, 22, '#58C8FF'),
    ],
    true,
  ),
]
export const QBR_DATA: ISlideData = {
  id: 'qbr-fy2027-q2',
  name: 'Northstar / FY2027 Q2 Business Review',
  appVersion: '1.0.0-rc.0',
  rev: 1,
  locale: LocaleType.EN_US,
  defaultPageSize: { width: 1200, height: 675 },
  slideOrder: pages.map((page) => page.id),
  activeSlideId: 'scorecard',
  slides: Object.fromEntries(pages.map((page) => [page.id, page])),
}
