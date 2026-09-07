import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/presets'
import { CustomRangeType } from '@univerjs/presets'

export const EXTERNAL_URL = 'https://univer.ai/?source=showcase&topic=links#features'
function linked(text: string, spans: { label: string; url: string }[]): ICellData {
  return {
    p: {
      id: 'driftwood-' + text,
      documentStyle: { marginTop: 0, marginBottom: 2, marginLeft: 2, marginRight: 2 },
      body: {
        dataStream: text + '\r\n',
        paragraphs: [{ startIndex: text.length, paragraphId: 'paragraph-' + text }],
        sectionBreaks: [{ startIndex: text.length + 1, sectionId: 'section-' + text }],
        customRanges: spans.map(({ label, url }, index) => ({
          rangeId: 'link-' + text + '-' + index,
          rangeType: CustomRangeType.HYPERLINK,
          startIndex: text.indexOf(label),
          endIndex: text.indexOf(label) + label.length - 1,
          properties: { url },
        })),
      },
    },
  }
}
function sheet(id: string, name: string, rows: (string | number | null | ICellData)[][]): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 30,
    columnCount: 8,
    defaultRowHeight: 34,
    rowHeader: { width: 46 },
    columnHeader: { height: 28 },
    columnData: { 0: { w: 160 }, 1: { w: 230 }, 2: { w: 250 }, 3: { w: 120 } },
    cellData: Object.fromEntries(
      rows.map((values, row) => [
        row,
        Object.fromEntries(
          values.map((value, col) => [
            col,
            typeof value === 'object' && value !== null
              ? value
              : { v: value, ...(row === 0 ? { s: { bl: 1, bg: { rgb: '#fef3c7' } } } : {}) },
          ]),
        ),
      ]),
    ),
  }
}
// Original fictional harbor lighting records; no network fixtures.
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'driftwood-links',
  name: 'Driftwood harbor lighting',
  sheetOrder: ['index', 'workshop'],
  sheets: {
    index: sheet('index', 'Field index', [
      ['Route card', 'Reference', 'Purpose', 'Open tasks'],
      [
        'Cedar pier',
        linked('Univer website', [{ label: 'Univer website', url: EXTERNAL_URL }]),
        'External URL: query + fragment',
        0,
      ],
      [
        'Lamp workshop',
        linked('Workshop sheet', [{ label: 'Workshop sheet', url: '#gid=workshop' }]),
        'Whole worksheet',
        3,
      ],
      [
        'Bay inspection',
        linked('Repair window', [{ label: 'Repair window', url: '#gid=workshop&range=B3:D4' }]),
        'Specific repair cells',
        2,
      ],
      [
        'Inventory reserve',
        linked('Reserved lamps', [{ label: 'Reserved lamps', url: '#rangeid=reserved-lamps' }]),
        'Named range',
        5,
      ],
      [
        'Two references',
        linked('Permits | Routing', [
          { label: 'Permits', url: '#gid=workshop&range=A2' },
          { label: 'Routing', url: EXTERNAL_URL },
        ]),
        'Two independent text spans',
        1,
      ],
      ['Night survey', null, 'Empty target for insertion', 0],
      ['Harbor gate', 'Not yet linked', 'Plain text target', 4],
    ]),
    workshop: sheet('workshop', 'Workshop', [
      ['Asset', 'Lantern type', 'Location', 'Stock'],
      ['DW-104', 'Shielded amber', 'Cedar pier', 3],
      ['DW-207', 'Low-glare white', 'West quay', 0],
      ['DW-318', 'Solar marker', 'North basin', 6],
      ['DW-425', 'Emergency beacon', null, 2],
      [null, 'Reserve amber', 'Stores', 5],
    ]),
  },
  resources: [
    {
      name: 'SHEET_DEFINED_NAME_PLUGIN',
      data: JSON.stringify({
        'reserved-lamps': {
          id: 'reserved-lamps',
          name: 'ReservedLamps',
          formulaOrRefString: 'Workshop!$B$6:$D$6',
          comment: 'Original reserve inventory',
          localSheetId: 'AllDefaultWorkbook',
        },
      }),
    },
  ],
}
