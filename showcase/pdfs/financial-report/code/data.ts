import type { FUniver } from '@univerjs/core/facade'

import '@univerjs-pro/pdfs/facade'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
export const REPORT_TITLE = 'Asteria Energy / FY2026'
// Original fictional annual report: no real issuer, audit opinion or investment recommendation.
// Monetary figures are USD millions unless a row explicitly names another unit.
export const REPORT_SECTIONS = [
  {
    title: 'Annual performance overview',
    note: 'Storage deployments and service renewals supported growth. These original synthetic figures are an SDK review exercise, not published company results.',
    rows: [
      ['Key measure', 'FY2026'],
      ['Revenue', '428.6'],
      ['Operating profit', '72.4'],
      ['Adjusted EBITDA', '96.2'],
      ['Operating cash flow', '71.8'],
      ['Free cash flow', '50.8'],
      ['Net debt', '184.0'],
    ],
  },
  {
    title: 'Income statement',
    note: 'Expenses are shown in parentheses. Revenue less cost of sales gives gross profit; operating expenses, finance costs and tax reconcile to net profit.',
    rows: [
      ['Statement line', 'FY2026'],
      ['Revenue', '428.6'],
      ['Cost of sales', '(281.4)'],
      ['Gross profit', '147.2'],
      ['Research and development', '(28.7)'],
      ['Selling and administration', '(46.1)'],
      ['Operating profit', '72.4'],
      ['Net finance costs', '(10.8)'],
      ['Profit before tax', '61.6'],
      ['Income tax', '(15.4)'],
      ['Net profit', '46.2'],
    ],
  },
  {
    title: 'Statement of financial position',
    note: 'Assets equal liabilities plus equity at 31 December 2026. The provision includes the interconnection estimate discussed on page 12.',
    rows: [
      ['Balance', 'FY2026'],
      ['Cash / receivables / inventory', '62.0 / 84.6 / 71.3'],
      ['Property, plant and equipment', '246.7'],
      ['Intangibles / other assets', '35.4 / 12.0'],
      ['Total assets', '512.0'],
      ['Trade payables', '78.5'],
      ['Borrowings', '246.0'],
      ['Provisions / other liabilities', '12.0 / 29.3'],
      ['Total liabilities', '365.8'],
      ['Total equity', '146.2'],
      ['Liabilities and equity', '512.0'],
    ],
  },
  {
    title: 'Cash flow statement',
    note: 'Cash increased by 28.2 from 33.8 to 62.0. Free cash flow is operating cash flow less capital expenditure; it is a defined management measure here.',
    rows: [
      ['Cash flow', 'FY2026'],
      ['Operating cash flow', '71.8'],
      ['Capital expenditure', '(21.0)'],
      ['Acquisitions', '(4.0)'],
      ['Net investing cash flow', '(25.0)'],
      ['Dividends / debt repayment', '(12.0) / (5.6)'],
      ['Net financing cash flow', '(17.6)'],
      ['Exchange effect', '(1.0)'],
      ['Opening / closing cash', '33.8 / 62.0'],
      ['Free cash flow', '50.8'],
    ],
  },
  {
    title: 'Operating segments',
    note: 'Regional revenue and operating profit reconcile to the consolidated statement. APAC commissioning delays limited the regional profit contribution.',
    rows: [
      ['Region', 'Revenue / operating profit'],
      ['North America', '216.0 / 42.5'],
      ['Northern Europe', '148.4 / 25.8'],
      ['Asia Pacific', '64.2 / 4.1'],
      ['Consolidated', '428.6 / 72.4'],
    ],
  },
  {
    title: 'Revenue recognition',
    note: 'The 8.4 awaiting customer acceptance is excluded from recognized revenue. Reviewers should distinguish an open milestone from an unbilled amount already recognized.',
    rows: [
      ['Recognition category', 'Amount'],
      ['Invoiced revenue', '396.0'],
      ['Unbilled recognized revenue', '32.6'],
      ['Total recognized revenue', '428.6'],
      ['Pending acceptance (excluded)', '8.4'],
      ['Recognized disputed milestones', '0.0'],
    ],
  },
  {
    title: 'Margin reconciliation',
    note: 'Operating margin: 16.9% (72.4 operating profit / 428.6 revenue). Do not confuse it with the 22.4% adjusted EBITDA margin.',
    rows: [
      ['Measure', 'Calculation / result'],
      ['Operating profit', '72.4'],
      ['Depreciation and amortization', '23.8'],
      ['Adjusted EBITDA', '96.2'],
      ['Operating margin', '72.4 / 428.6 = 16.9%'],
      ['Adjusted EBITDA margin', '96.2 / 428.6 = 22.4%'],
    ],
  },
  {
    title: 'Borrowings and liquidity',
    note: 'Gross borrowings of 246.0 less cash of 62.0 produce net debt of 184.0. The maturity profile below describes principal, not discounted fair values.',
    rows: [
      ['Maturity / facility', 'Amount'],
      ['Due within 12 months', '46.0'],
      ['Due in months 13–24', '80.0'],
      ['Due after 24 months', '120.0'],
      ['Total borrowings', '246.0'],
      ['Cash', '(62.0)'],
      ['Net debt', '184.0'],
      ['Undrawn committed facility', '55.0'],
    ],
  },
  {
    title: 'Working capital and credit',
    note: 'Receivable aging totals 84.6. The working-capital definition used here includes receivables and inventory less trade payables; cash and debt are excluded.',
    rows: [
      ['Working-capital item', 'Amount'],
      ['Receivables: current', '61.2'],
      ['Receivables: 1–30 days overdue', '14.4'],
      ['Receivables: over 30 days', '9.0'],
      ['Total receivables', '84.6'],
      ['Inventory', '71.3'],
      ['Trade payables', '(78.5)'],
      ['Net working capital', '77.4'],
    ],
  },
  {
    title: 'Capital projects',
    note: 'Capital expenditure totals 21.0. Two projects await grid connections. Approval status and spend are separate facts; an approved project can have zero current-year spend.',
    rows: [
      ['Project', 'Spend / status'],
      ['Mesa storage expansion', '13.2 / commissioned'],
      ['Grid analytics platform', '3.1 / active'],
      ['Service hub modernization', '4.7 / active'],
      ['APAC connection studies', '0.0 / approved'],
      ['Total capital expenditure', '21.0'],
      ['Delayed commissioning sites', '2 sites'],
    ],
  },
  {
    title: 'Foreign-exchange exposure',
    note: 'This is a synthetic sensitivity, not a current exchange-rate quote. EUR equipment commitments exceed EUR receivables; a 10% adverse move is illustrated before hedging.',
    rows: [
      ['Exposure assumption', 'Value'],
      ['EUR receivables', 'EUR 38.0M'],
      ['EUR equipment commitments', 'EUR (44.0)M'],
      ['Net EUR exposure', 'EUR (6.0)M'],
      ['Assumed USD per EUR', '1.10'],
      ['Net USD-equivalent exposure', 'USD (6.6)M'],
      ['10% adverse sensitivity', 'USD (0.66)M'],
    ],
  },
  {
    title: 'Provisions and commitments',
    note: 'The 12.0 provision is recognized in the financial position. The separate 29.0 future capital commitment is not added to that provision. Estimates are scenario inputs, not predictions.',
    rows: [
      ['Provision / commitment', 'Amount'],
      ['Interconnection approvals', '6.5'],
      ['Site restoration', '3.0'],
      ['Warranty estimate', '2.5'],
      ['Recognized provision', '12.0'],
      ['Future capital commitment', '29.0'],
    ],
  },
  {
    title: 'Policies and estimates',
    note: 'The fictional report uses a consistent USD-million presentation. Totals are unrounded inputs displayed to one decimal; ratios are rounded independently to one decimal percent.',
    rows: [
      ['Policy topic', 'Illustrative convention'],
      ['Revenue', 'Customer control / acceptance'],
      ['Inventory', 'Lower of cost and recovery'],
      ['Depreciation', 'Useful-life allocation'],
      ['Provisions', 'Best estimate, reviewed yearly'],
      ['Adjustments', 'None beyond stated definitions'],
      ['Comparative period', 'Not included in this exercise'],
    ],
  },
  {
    title: 'Illustrative assurance discussion',
    note: 'No auditor has examined this fictional dataset and no assurance is expressed. This page illustrates the placement of an opinion discussion; it is not a real audit report or an unqualified opinion.',
    rows: [
      ['Review area', 'Open exercise question'],
      ['Revenue acceptance', 'Inspect the excluded 8.4 milestone'],
      ['Margin definition', 'Separate operating and EBITDA'],
      ['Liquidity', 'Check debt and cash reconciliation'],
      ['Provisions', 'Challenge the 12.0 estimate'],
      ['Review sign-off', 'Not performed / no assurance'],
    ],
  },
] as const

export function createReport(api: FUniver, empty = false) {
  const pdf = api.createPdf({
    id: 'asteria-financial-review',
    name: REPORT_TITLE,
    metadata: { reviewDate: REVIEW_DATE },
  })
  if (empty) return pdf
  REPORT_SECTIONS.forEach((section, index) => {
    const page = index === 0 ? pdf.getPageByIndex(0)! : pdf.insertPage()
    const text = (id: string, value: string, top: number, fontSize: number, height: number, fill = '#243746') =>
      page.insertTextBox({ id, text: value, left: 46, top, width: 500, height, fontSize, fontFamily: 'Arial', fill })
    text(`eyebrow-${index}`, `${REPORT_TITLE} / ORIGINAL FICTIONAL DATA`, 36, 9, 20, '#2563eb')
    text(`title-${index}`, section.title, 78, 22, 70).setTextStyle({ bold: true })
    page.insertDivider({ id: `rule-${index}`, left: 46, top: 154, width: 500, strokeColor: '#cbd5e1' })
    page.insertParagraph({
      id: index === 6 ? 'margin-note' : `note-${index}`,
      text: section.note,
      left: 46,
      top: 180,
      width: 500,
      height: 80,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#243746',
    })
    const table = page.insertTable({
      id: `statement-${index}`,
      left: 46,
      top: 290,
      width: 500,
      height: section.rows.length * 30,
      rowCount: section.rows.length,
      columnCount: 2,
      cellTexts: section.rows.flat(),
    })
    table.getCell(0, 0).setStyle({ fontColor: '#2563eb' })
    table.getCell(0, 1).setStyle({ fontColor: '#2563eb' })
    text(
      `footer-${index}`,
      `Year ended 31 December 2026 / Review: 31 March 2027 / ${index + 1} of 14 / NOT AUDITED`,
      780,
      8,
      24,
      '#64748b',
    )
  })
  return pdf
}
