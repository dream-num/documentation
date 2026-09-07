import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'ember-incident-costs'
export const CHILD_ID = 'ember-incident-review'
export const SHEET_ID = 'loss-estimate'

// Original fictional service incident. Estimates and hypotheses are not confirmed losses or findings.
const EVENTS = [
  { id: 'alert', text: '09:12 / DETECT\nCheckout errors\nMina / On-call', left: 40, top: 150, color: '#F6D8CE' },
  { id: 'triage', text: '09:18 / TRIAGE\nPool saturation\nTheo / Platform', left: 290, top: 150, color: '#F9E9C8' },
  {
    id: 'rollback',
    text: '09:31 / MITIGATE\nRoll back release\nJules / Release',
    left: 540,
    top: 150,
    color: '#DCECF2',
  },
  { id: 'recover', text: '09:46 / RECOVER\nError rate normal\nMina / On-call', left: 790, top: 150, color: '#DEEDE2' },
  { id: 'cause', text: 'HYPOTHESIS\nRetry amplification\nTrace review pending', left: 165, top: 380, color: '#F9E9C8' },
  {
    id: 'guardrail',
    text: 'ACTION / Theo\nCap client retries\nDue 16 Oct / Open',
    left: 465,
    top: 380,
    color: '#E8E1F1',
  },
  {
    id: 'rehearsal',
    text: 'ACTION / Jules\nRehearse rollback\nDue 18 Oct / Open',
    left: 765,
    top: 380,
    color: '#DCECF2',
  },
] as const
const EDGES = [
  ['detect-triage', 'alert', 1, 'triage', 3],
  ['triage-rollback', 'triage', 1, 'rollback', 3],
  ['rollback-recover', 'rollback', 1, 'recover', 3],
  ['triage-cause', 'triage', 2, 'cause', 0],
  ['cause-guardrail', 'cause', 1, 'guardrail', 3],
  ['guardrail-rehearsal', 'guardrail', 1, 'rehearsal', 3],
] as const

export function createChildData(): IBoardData {
  const shapes = EVENTS.map((item) => {
    const shape = createBoardTextBoxShapeElement({
      id: item.id,
      text: item.text,
      left: item.left,
      top: item.top,
      width: 210,
      height: 115,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 14, cl: { rgb: '#3E454C' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: item.color }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#A99D94', width: 1.5 }
    return shape
  })
  const connectors = EDGES.map(([id, from, fromSide, to, toSide]) =>
    createBoardConnectorElement({
      id,
      start: { kind: 'shapeSite', shapeId: from, connectionSiteId: fromSide },
      end: { kind: 'shapeSite', shapeId: to, connectionSiteId: toSide },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: '#A06D56', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const labels = [
    { id: 'title', text: 'EMBER / The 34-minute checkout incident', top: 15, height: 60, fs: 28, color: '#9C4F37' },
    {
      id: 'subtitle',
      text: '12 OCT 2027  /  SERVICE RECOVERED  /  FOLLOW-UPS OPEN',
      top: 85,
      height: 40,
      fs: 13,
      color: '#76685C',
    },
    { id: 'lane', text: 'WHAT WE STILL NEED TO LEARN', top: 310, height: 45, fs: 17, color: '#9C4F37' },
    {
      id: 'note',
      text: 'Recovery is not closure. Validate the cause before accepting the corrective actions.\nThe workbook is an estimate; changing a cost does not change this review.',
      top: 550,
      height: 75,
      fs: 15,
      color: '#6C655F',
    },
  ].map((item) =>
    createBoardTextBoxShapeElement({
      id: item.id,
      text: item.text,
      left: item.id === 'lane' ? 465 : 40,
      top: item.top,
      width: item.id === 'lane' ? 535 : 960,
      height: item.height,
      textStyle: { fs: item.fs, bl: BooleanNumber.TRUE, cl: { rgb: item.color } },
      textWrap: ShapeTextWrapType.Square,
    }),
  )
  const elements = [...connectors, ...shapes, ...labels]
  return {
    id: CHILD_ID,
    name: 'Ember / Incident review',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1060, height: 660 },
    pageOrder: ['incident'],
    activePageId: 'incident',
    pages: {
      incident: {
        id: 'incident',
        name: 'Timeline and follow-ups',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((item) => item.id),
        elements: Object.fromEntries(elements.map((item) => [item.id, item])),
      },
    },
  }
}

const COSTS = [
  ['Affected checkouts', 340, 12, 'Contribution at risk; not gross revenue'],
  ['Support response', 18, 28, 'Agent hours; excludes normal shift cover'],
  ['Engineering response', 24, 65, 'Combined response and recovery hours'],
  ['Goodwill credits', 72, 8, 'Expected claims, not issued credits'],
  ['Extra observability', 1, 140, 'Short-lived diagnostic capacity'],
  ['Recovery rehearsal', 6, 55, 'Planned follow-up engineering hours'],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'EMBER / Incident cost review', s: 'title' } },
    1: { 0: { v: '12 October 2027 · checkout service · fictional USD estimates', s: 'muted' } },
    3: {
      0: { v: 'Exposure / response', s: 'header' },
      1: { v: 'Quantity', s: 'header' },
      2: { v: 'Unit cost', s: 'header' },
      3: { v: 'Estimate', s: 'header' },
      4: { v: 'Basis and exclusions', s: 'header' },
    },
    11: { 0: { v: 'Modelled exposure', s: 'header' }, 3: { f: '=SUM(D5:D10)', s: 'total' } },
    13: { 0: { v: 'Planning reserve / 15%', s: 'body' }, 3: { f: '=D12*15%', s: 'money' } },
    15: { 0: { v: 'Planning envelope', s: 'header' }, 3: { f: '=D12+D14', s: 'total' } },
    18: { 0: { v: '34 MINUTES / 09:12–09:46', s: 'section' } },
    20: { 0: { v: 'Service recovered; cause validation and follow-ups remain open.', s: 'muted' } },
    22: { 0: { v: 'Open Incident timeline for the native Board. Open Review gates for closure criteria.', s: 'body' } },
    24: { 0: { v: 'Yellow cells are assumptions. The model is not booked loss or an insurance claim.', s: 'warning' } },
  }
  COSTS.forEach(([label, quantity, cost, basis], i) => {
    const row = i + 4
    cellData[row] = {
      0: { v: label, s: i % 2 ? 'stripe' : 'body' },
      1: { v: quantity, s: 'input' },
      2: { v: cost, s: 'money' },
      3: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
      4: { v: basis, s: 'muted' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Ember / Incident costs',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'review-gates'],
    styles: {
      title: { fs: 23, bl: 1, cl: { rgb: '#9C4F37' } },
      section: { fs: 16, bl: 1, cl: { rgb: '#9C4F37' } },
      header: { bg: { rgb: '#EDD8CC' }, cl: { rgb: '#693E30' }, bl: 1 },
      body: { cl: { rgb: '#474B50' } },
      stripe: { bg: { rgb: '#F8F2EC' } },
      muted: { fs: 11, cl: { rgb: '#726C66' } },
      warning: { fs: 11, cl: { rgb: '#985437' } },
      input: { bg: { rgb: '#F9E9C8' }, cl: { rgb: '#785923' }, n: { pattern: '0' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#474B50' } },
      total: { n: { pattern: '#,##0.00' }, bg: { rgb: '#DEEDE2' }, cl: { rgb: '#37614B' }, bl: 1 },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Loss estimate',
        rowCount: 45,
        columnCount: 12,
        defaultRowHeight: 30,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 245 }, 1: { w: 95 }, 2: { w: 110 }, 3: { w: 125 }, 4: { w: 385 } },
        cellData,
        mergeData: [0, 1, 18, 20, 22, 24].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
      'review-gates': {
        id: 'review-gates',
        name: 'Review gates',
        rowCount: 35,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 130,
        columnData: { 0: { w: 255 }, 1: { w: 200 }, 2: { w: 370 } },
        cellData: {
          0: { 0: { v: 'EMBER / Recovery is not closure', s: 'title' } },
          2: { 0: { v: 'Current planning envelope', s: 'header' }, 1: { f: "='Loss estimate'!D16", s: 'total' } },
          4: {
            0: { v: 'Review gate', s: 'header' },
            1: { v: 'Owner / state', s: 'header' },
            2: { v: 'Required evidence', s: 'header' },
          },
          5: {
            0: { v: 'Cause validation', s: 'body' },
            1: { v: 'Theo / Pending', s: 'input' },
            2: { v: 'Replay traces with and without retries', s: 'muted' },
          },
          6: {
            0: { v: 'Credit reconciliation', s: 'body' },
            1: { v: 'Nora / Pending', s: 'input' },
            2: { v: 'Match issued credits to eligible claims', s: 'muted' },
          },
          7: {
            0: { v: 'Rollback rehearsal', s: 'body' },
            1: { v: 'Jules / Scheduled', s: 'input' },
            2: { v: 'Timed recovery rehearsal on 18 October', s: 'muted' },
          },
          10: { 0: { v: 'Local training data. No live incident feed, approval or persistence.', s: 'warning' } },
        },
        mergeData: [0, 10].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 2 })),
      },
    },
  }
}
