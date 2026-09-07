import type { IWorkbookData } from '@univerjs/presets'

// Original vector illustrations: no remote image requests, fonts or borrowed template assets.
const svg = (width: number, height: number, body: string) =>
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  )

export const ASSETS = [
  {
    id: 'route',
    label: 'Wide · field route',
    width: 320,
    height: 160,
    source: svg(
      320,
      160,
      '<rect width="320" height="160" fill="#dbeafe"/><path d="M0 130 75 40 140 115 215 25 320 125V160H0" fill="#0f766e"/><path d="m25 145 80-20 45 15 55-55 85 10" fill="none" stroke="#fbbf24" stroke-width="8"/><circle cx="290" cy="95" r="9" fill="#ef4444"/><text x="16" y="23" font-family="sans-serif" font-size="16" fill="#172554">CEDAR / RIDGE 04</text>',
    ),
  },
  {
    id: 'sensor',
    label: 'Square · sensor badge',
    width: 160,
    height: 160,
    source: svg(
      160,
      160,
      '<rect width="160" height="160" rx="20" fill="#fef3c7"/><circle cx="80" cy="74" r="45" fill="#b45309"/><circle cx="80" cy="74" r="28" fill="#fffbeb"/><path d="M80 74 96 54" stroke="#b45309" stroke-width="7"/><circle cx="80" cy="74" r="6" fill="#b45309"/><text x="33" y="142" font-family="sans-serif" font-size="16" fill="#78350f">SENSOR 7</text>',
    ),
  },
  {
    id: 'tag',
    label: 'Portrait · safety tag',
    width: 120,
    height: 200,
    source: svg(
      120,
      200,
      '<path d="M20 0H100L120 30V200H0V30Z" fill="#e9d5ff"/><circle cx="60" cy="21" r="7" fill="#fff"/><path d="m60 45 40 69H20Z" fill="#7e22ce"/><path d="M60 65v24" stroke="#fff" stroke-width="7"/><circle cx="60" cy="102" r="4" fill="#fff"/><text x="17" y="141" font-family="sans-serif" font-size="15" fill="#581c87">CHECK IN</text><text x="18" y="167" font-family="sans-serif" font-size="13" fill="#581c87">BEFORE 18:00</text>',
    ),
  },
]

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'cedar-image-workbook',
  name: 'Cedar field station · image inventory',
  sheetOrder: ['inventory', 'checks'],
  sheets: {
    inventory: {
      id: 'inventory',
      name: 'Field inventory',
      rowCount: 36,
      columnCount: 12,
      defaultColumnWidth: 100,
      defaultRowHeight: 32,
      rowData: { 3: { h: 90 }, 4: { h: 90 }, 5: { h: 90 } },
      columnData: { 0: { w: 135 }, 1: { w: 200 }, 2: { w: 90 }, 3: { w: 80 } },
      cellData: {
        0: { 0: { v: 'Cedar field station', s: { bl: 1, fs: 16 } } },
        1: { 0: { v: 'Cell images: A4:A6. Floating images: E4 onwards.' } },
        2: {
          0: { v: 'Thumbnail' },
          1: { v: 'Equipment' },
          2: { v: 'Mass / kg' },
          3: { v: 'Units' },
          4: { v: 'Drawing workspace →' },
        },
        3: { 1: { v: 'Ridge route / 04' }, 2: { v: 0.08 }, 3: { v: 12 } },
        4: { 1: { v: 'Temperature sensor 7' }, 2: { v: 0.35 }, 3: { v: 0 } },
        5: { 1: { v: 'Safety tag · Éloïse' }, 2: { v: 0.02 }, 3: { v: 8 } },
        8: { 0: { v: 'Total packed mass' }, 2: { f: '=SUMPRODUCT(C4:C6,D4:D6)' } },
        10: { 0: { v: 'Native drag, resize and Undo are available.' } },
        13: { 0: { v: 'Outside image targets — keep this note.' } },
      },
    },
    checks: {
      id: 'checks',
      name: 'Reference',
      rowCount: 20,
      columnCount: 8,
      defaultColumnWidth: 160,
      defaultRowHeight: 32,
      cellData: {
        0: { 0: { v: 'Field checklist' } },
        2: { 0: { v: 'Battery charged' }, 1: { v: 'Yes' } },
        3: { 0: { v: 'Return time' }, 1: { v: '18:00' } },
      },
    },
  },
}
