import type { ISlideData, ISlidePage, ISlidePageElement, ISlideShapeElement } from '@univerjs-pro/slides'
import { applyShapeTextAlignment, ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum } from '@univerjs-pro/slides'
import { HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export const MILESTONES = [
  { id: 'beta', date: 'FEB 03', label: 'Private beta', day: 0 },
  { id: 'feedback', date: 'FEB 10', label: 'Feedback review', day: 7 },
  { id: 'enablement', date: 'FEB 17', label: 'Partner enablement', day: 14 },
  { id: 'security', date: 'FEB 24', label: 'Security sign-off', day: 21 },
  { id: 'ga', date: 'MAR 03', label: 'General availability', day: 28 },
  { id: 'review', date: 'MAR 17', label: 'Launch review', day: 42 },
] as const
export const timelineX = (day: number) => 100 + (day * 900) / 42
export const LAUNCH_METRICS = {
  fictional: true,
  year: 2027,
  personas: 3,
  painPoints: 4,
  capabilities: 5,
  reviewMinutes: { before: 30, after: 12.5, ratio: 2.4 },
  medianSetupMinutes: 18,
  pilot: { invited: 50, active: 43, adoptionPercent: 86 },
  milestones: MILESTONES,
}

export const PRODUCT_LAUNCH_DATA: ISlideData = {
  id: 'atlas-product-launch',
  name: 'Atlas Product Launch',
  appVersion: '1.0.0-beta.2',
  rev: 1,
  locale: LocaleType.EN_US,
  defaultPageSize: { width: 1200, height: 675 },
  slideOrder: [
    'story',
    'personas',
    'friction',
    'capabilities',
    'workflow',
    'proof',
    'roadmap',
    'rollout',
    'readiness',
    'next',
    'closing',
  ],
  activeSlideId: 'story',
  slides: {
    story: slide('story', 'Product Story', '#FFFFFF', [
      text('eyebrow', 'ATLAS · FICTIONAL PRODUCT LAUNCH', 94, 80, 960, 45, 17, '#175CD3', true),
      text('title', 'Turn operating data into\nactionable workspaces', 92, 148, 1010, 175, 42, '#101828', true),
      text('proof', '3 personas · 4 pain points · 5 capabilities · 6 milestones', 96, 350, 1010, 60, 20, '#475467'),
      card('speed', '2.4×\nfaster review', 96, '#175CD3'),
      card('setup', '18 min\nmedian setup', 388, '#027A48'),
      card('adoption', '86%\npilot adoption', 680, '#7F56D9'),
    ]),
    rollout: slide('rollout', 'Rollout', '#FFFFFF', [
      text('rollout-title', 'Launch milestones', 92, 70, 850, 60, 36, '#101828', true),
      shape('timeline', 100, 315, 900, 8, '#98A2B3'),
      ...MILESTONES.flatMap((milestone, index) => [
        text(
          milestone.id === 'ga' ? 'ga-date' : milestone.id,
          `${milestone.date}\n${milestone.label}`,
          timelineX(milestone.day) - 60,
          index % 2 ? 350 : 205,
          235,
          100,
          16,
          '#344054',
          true,
        ),
        shape(`${milestone.id}-marker`, timelineX(milestone.day) - 8, 311, 16, 16, '#175CD3'),
      ]),
      text(
        'rollout-note',
        'GA readiness requires 99.95% availability and all launch blockers closed.',
        100,
        490,
        940,
        72,
        21,
        '#475467',
      ),
    ]),
    personas: slide('personas', 'Three people, three decisions', '#EFF8FF', [
      text('title', 'Who needs the workspace?', 70, 60, 1040, 80, 34, '#101828', true),
      text(
        'operations',
        'OPERATIONS LEAD\nPrioritize exceptions.\nOwn the daily handoff.',
        75,
        195,
        320,
        240,
        22,
        '#175CD3',
      ),
      text('analyst', 'ANALYST\nTrace each number.\nExplain the change.', 440, 195, 300, 240, 22, '#027A48'),
      text(
        'partner',
        'PARTNER MANAGER\nPrepare the rollout.\nTrack readiness gates.',
        795,
        195,
        325,
        240,
        22,
        '#6941C6',
      ),
      text(
        'note',
        'Illustrative roles, not interview quotations or real customer endorsements.',
        75,
        520,
        1040,
        60,
        17,
        '#475467',
      ),
    ]),
    friction: slide('friction', 'Four sources of friction', '#FFFAEB', [
      text('title', 'The handoff breaks in four places', 70, 60, 1050, 90, 32, '#101828', true),
      text('a', '01 / Fragmented files\nNo agreed source for the latest view.', 75, 195, 490, 130, 22, '#344054'),
      text(
        'b',
        '02 / Unowned exceptions\nAn alert does not assign\nresponsibility.',
        620,
        195,
        490,
        130,
        22,
        '#344054',
      ),
      text('c', '03 / Repeated setup\nEach team rebuilds the same\nchecklist.', 75, 385, 490, 130, 22, '#344054'),
      text(
        'd',
        '04 / Hidden dependencies\nDates move without the next team knowing.',
        620,
        385,
        490,
        150,
        22,
        '#344054',
      ),
    ]),
    capabilities: slide('capabilities', 'Five capabilities', '#FFFFFF', [
      text('title', 'A focused launch, not every feature', 70, 60, 1050, 90, 32, '#101828', true),
      text(
        'list',
        '1. Bring structured data into one view.\n2. Link exceptions to accountable owners.\n3. Reuse team workspace templates.\n4. Explain changes with inline context.\n5. Track milestone dependencies.',
        100,
        190,
        1000,
        330,
        24,
        '#344054',
      ),
      text(
        'note',
        'This is fictional product positioning; it is not a claim about Univer SDK feature availability.',
        100,
        555,
        1000,
        65,
        16,
        '#475467',
      ),
    ]),
    workflow: slide('workflow', 'The review loop', '#ECFDF3', [
      text('title', 'From a signal to a completed handoff', 70, 65, 1060, 90, 32, '#101828', true),
      shape('line', 160, 335, 830, 10, '#75E0A7'),
      text('observe', 'OBSERVE\nWhat changed?', 80, 230, 280, 160, 26, '#027A48', true),
      text('decide', 'DECIDE\nWho owns it?', 455, 230, 280, 160, 26, '#027A48', true),
      text('close', 'CLOSE\nWhat happened?', 835, 230, 320, 160, 26, '#027A48', true),
      text(
        'note',
        'Keep context with the decision. Review unresolved work before the next shift.',
        100,
        480,
        1000,
        90,
        21,
        '#344054',
      ),
    ]),
    proof: slide('proof', 'Illustrative pilot measures', '#FFFFFF', [
      text('title', 'Show the denominator', 70, 60, 1040, 85, 34, '#101828', true),
      text('review', 'REVIEW TIME\n30 min → 12.5 min\n30 ÷ 12.5 = 2.4×', 75, 200, 320, 230, 23, '#175CD3'),
      text('setup', 'SETUP\n18 min median\nIllustrative pilot\nmeasure', 435, 200, 325, 230, 23, '#027A48'),
      text('adoption', 'ADOPTION\n43 active / 50 invited\n43 ÷ 50 = 86%', 795, 200, 325, 230, 23, '#6941C6'),
      text(
        'note',
        'Synthetic figures for this template.\nNo real experiment, customer result or statistical inference is asserted.',
        75,
        500,
        1045,
        95,
        18,
        '#475467',
      ),
    ]),
    roadmap: slide('roadmap', 'Launch scope', '#F4F3FF', [
      text('title', 'What ships now, what waits', 70, 60, 1050, 85, 34, '#101828', true),
      text(
        'now',
        'IN THIS LAUNCH\nWorkspace setup\nException ownership\nMilestone review',
        90,
        195,
        460,
        290,
        26,
        '#175CD3',
        true,
      ),
      text(
        'later',
        'AFTER VALIDATION\nAdditional connectors\nExpanded team templates\nNew approval workflows',
        630,
        195,
        470,
        290,
        26,
        '#6941C6',
        true,
      ),
      text(
        'note',
        'Future items are options for the fictional launch, not SDK delivery commitments.',
        90,
        535,
        1010,
        65,
        18,
        '#475467',
      ),
    ]),
    readiness: slide('readiness', 'Launch gates', '#FFF4ED', [
      text('title', 'A date is not a readiness decision', 70, 60, 1050, 85, 32, '#101828', true),
      text(
        'gates',
        'Availability target / 99.95%\nLaunch blockers / all closed\nPartner enablement / materials reviewed\nSupport handoff / owner confirmed',
        95,
        195,
        1010,
        270,
        25,
        '#344054',
      ),
      text(
        'note',
        'Targets only. The demo does not contact monitoring systems or certify these gates as passed.',
        95,
        510,
        1010,
        95,
        18,
        '#B54708',
      ),
    ]),
    next: slide('next', 'The next seven days', '#EFF8FF', [
      text('title', 'When GA moves, keep the plan legible', 70, 60, 1050, 95, 32, '#101828', true),
      text(
        'checklist',
        'Confirm the readiness review.\nNotify the enablement owner.\nMove the GA marker and its label together.\nKeep the launch-review milestone unchanged.',
        95,
        210,
        1010,
        260,
        25,
        '#344054',
      ),
      text(
        'note',
        'The milestone recipe is a local SDK edit only; no message is sent to anyone.',
        95,
        535,
        1010,
        65,
        18,
        '#475467',
      ),
    ]),
    closing: slide('closing', 'Launch with a clear handoff', '#ECFDF3', [
      text('title', 'Make the next decision visible.', 85, 130, 1030, 135, 40, '#101828', true),
      text(
        'next',
        'Review the gates. Name the owner.\nKeep the date and timeline in agreement.',
        90,
        315,
        1000,
        150,
        28,
        '#027A48',
      ),
      text('note', 'ATLAS / Original fictional launch template / 2027', 90, 555, 1000, 55, 17, '#475467'),
    ]),
  },
}

export const PRODUCT_LAUNCH_STARTER_DATA: ISlideData = {
  ...PRODUCT_LAUNCH_DATA,
  id: 'atlas-launch-starter',
  name: 'Your Product Launch',
  slideOrder: ['story', 'proof', 'rollout', 'blank'],
  slides: {
    story: slide('story', 'Start your story', '#EFF8FF', [
      text('eyebrow', 'LAUNCH STARTER / 01', 90, 75, 1000, 50, 18, '#175CD3', true),
      text('title', 'What changes for your customer?', 90, 180, 1020, 150, 40, '#101828', true),
      text(
        'prompt',
        'Name the audience. Describe the problem.\nMake one clear product promise.',
        90,
        380,
        1010,
        160,
        26,
        '#344054',
      ),
    ]),
    proof: slide('proof', 'Add your evidence', '#ECFDF3', [
      text('title', 'Replace claims with evidence', 90, 85, 1010, 100, 36, '#101828', true),
      text(
        'prompt',
        'What did you measure?\nCompared with which baseline?\nFor how many people, over what period?',
        90,
        245,
        1010,
        250,
        27,
        '#027A48',
      ),
      text('note', 'No pilot results have been entered in this starter deck.', 90, 565, 1010, 60, 18, '#475467'),
    ]),
    // Keep a working timeline example so the same SDK action can be explored here.
    rollout: structuredClone(PRODUCT_LAUNCH_DATA.slides.rollout),
    blank: {
      ...slide('blank', 'Blank canvas', '#FFFFFF', []),
      speakerNotes:
        'Start with the native Text box, Shape or Image controls. This page intentionally contains no elements.',
    },
  },
}

export const LAUNCH_MEDIA_SLOT = { id: 'launch-media', left: 100, top: 195, width: 1000, height: 340 }
export const PRODUCT_LAUNCH_MEDIA_DATA: ISlideData = {
  ...PRODUCT_LAUNCH_DATA,
  id: 'atlas-launch-media',
  name: 'Atlas Launch — Local Media',
  activeSlideId: 'closing',
  slides: {
    ...PRODUCT_LAUNCH_DATA.slides,
    closing: {
      ...slide('closing', 'Product walkthrough', '#FFFFFF', [
        text('title', 'Show the product in context', 90, 70, 1030, 85, 36, '#101828', true),
        shape('media-mat', 100, 195, 1000, 340, '#EFF8FF'),
        {
          ...shape(LAUNCH_MEDIA_SLOT.id, 100, 195, 1000, 340, '#EFF8FF'),
          name: 'Missing local media',
          shapeData: {
            shapeType: ShapeTypeEnum.Rect,
            fill: { fillType: ShapeFillEnum.NoFill },
            stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
            shapeText: {
              isHorizontal: true,
              isRichText: false,
              text: 'MEDIA NOT PROVIDED\nChoose a local PNG or JPEG to replace this placeholder.',
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#175CD3',
            },
          },
        },
        text(
          'note',
          'Local file only · aspect ratio preserved · image bytes saved in the snapshot',
          100,
          565,
          1000,
          65,
          18,
          '#475467',
        ),
      ]),
      speakerNotes:
        'Explain the product with your own screenshot. The missing-media placeholder is authored by this demo, not an SDK network-error handler. No asset is fetched or uploaded.',
    },
  },
}

function slide(id: string, name: string, color: string, elements: ISlidePageElement[]): ISlidePage {
  return {
    id,
    name,
    pageType: PageTypeEnum.Slide,
    speakerNotes: `Atlas fictional launch: ${name}. Retain these notes when updating milestones.`,
    background: { type: SlideBackgroundTypeEnum.Solid, color },
    elementOrder: elements.map((element) => element.id),
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
  }
}

function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  bold = false,
): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    // Legacy Text elements use the SDK's fixed white box/gray border.
    // Native text-box shapes expose fill, line and alignment without CSS overrides.
    shapeData: applyShapeTextAlignment(
      {
        shapeType: ShapeTypeEnum.Rect,
        isTextBox: true,
        fill: { fillType: ShapeFillEnum.NoFill },
        stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
        textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
        shapeText: { isHorizontal: true, isRichText: false, text: value, color, fontSize, bold, fontFamily: 'Arial' },
      },
      { horizontalAlign: HorizontalAlign.LEFT, verticalAlign: VerticalAlign.TOP },
    ),
  }
}

function card(id: string, value: string, left: number, color: string): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top: 455, width: 250, height: 125, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.RoundRect,
      fill: { color },
      stroke: { color, width: 0 },
      shapeText: { isHorizontal: true, isRichText: false, text: value, fontSize: 21, color: '#FFFFFF', bold: true },
    },
  }
}

function shape(
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  color: string,
): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
