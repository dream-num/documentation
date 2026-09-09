import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
const number = (v: number): ICellData => ({ v, t: CellValueType.NUMBER })
const title = (v: string): ICellData => ({ ...text(v), s: { fs: 19, bl: 1, cl: { rgb: '#155E75' } } })
const header = (v: string): ICellData => ({ ...text(v), s: { bl: 1, bg: { rgb: '#CFFAFE' } } })

export function createWorkbookData(): Partial<IWorkbookData> {
  const density: Record<number, Record<number, ICellData>> = {
    0: { 0: title('Read more rows, or inspect more closely') },
    1: {
      0: text(
        'Use the native bottom-right zoom control: compare 75%, 100% and 150%. Values and formulas stay unchanged.',
      ),
    },
    3: {
      0: header('Collection kit'),
      1: header('In stock'),
      2: header('Reserved'),
      3: header('Available'),
      4: header('Storage'),
    },
  }
  const kits = ['Lens cloths', 'Cotton gloves', 'Archive sleeves', 'Foam corners', 'Label holders', 'Display clips']
  for (let i = 0; i < 32; i++) {
    const row = i + 5
    density[row - 1] = {
      0: text(`${kits[i % kits.length]} / ${String(i + 1).padStart(2, '0')}`),
      1: { ...number(24 + ((i * 7) % 61)), s: { bg: { rgb: '#FEF3C7' } } },
      2: { ...number(3 + ((i * 3) % 19)), s: { bg: { rgb: '#FEF3C7' } } },
      3: { f: `=B${row}-C${row}`, s: { bg: { rgb: '#ECFDF5' } } },
      4: text(['West cabinet', 'North store', 'Annex shelf'][i % 3]),
    }
  }
  const wide: Record<number, Record<number, ICellData>> = {
    0: { 0: title('A wide exhibition schedule') },
    1: { 0: text('Scroll horizontally without changing your selection. Then use the name box to select AA12.') },
    2: {
      0: text(
        'Public scrollToCell moves the viewport; setActiveRange explicitly changes selection. No data is loaded on scroll.',
      ),
    },
    3: { 0: header('Workstream') },
  }
  const streams = ['Lighting', 'Conservation', 'Transport', 'Interpretation', 'Installation', 'Accessibility']
  for (let col = 1; col <= 30; col++) wide[3][col] = header(`Week ${String(col).padStart(2, '0')}`)
  for (let i = 0; i < 18; i++) {
    const row: Record<number, ICellData> = { 0: text(`${streams[i % 6]} / Hall ${Math.floor(i / 6) + 1}`) }
    for (let col = 1; col <= 30; col++) {
      const status = ['Plan', 'Build', 'Review', 'Ready', '—'][(i + col * 2) % 5]
      row[col] = {
        ...text(status),
        s: { bg: { rgb: status === 'Ready' ? '#D1FAE5' : status === 'Review' ? '#FEF3C7' : '#F8FAFC' } },
      }
    }
    wide[i + 4] = row
  }
  const frozen: Record<number, Record<number, ICellData>> = {
    0: { 0: title('Frozen routes') },
    1: { 0: text('4 header rows / 2 ID columns') },
    2: {
      0: text('Scroll both axes, then zoom'),
    },
    3: { 0: header('Depot'), 1: header('Route') },
  }
  for (let col = 2; col < 26; col++) frozen[3][col] = header(`Slot ${col - 1}`)
  for (let i = 0; i < 40; i++) {
    const row: Record<number, ICellData> = {
      0: text(['Harbor', 'Orchard', 'Upland', 'Canal'][i % 4]),
      1: text(`R-${101 + i}`),
    }
    for (let col = 2; col < 26; col++)
      row[col] = { ...number((i * 5 + col * 3) % 17), s: { bg: { rgb: i % 2 ? '#F0FDFA' : '#FFFFFF' } } }
    frozen[i + 4] = row
  }
  return {
    id: 'viewport-and-zoom',
    name: 'Reading and navigation',
    locale: LocaleType.EN_US,
    sheetOrder: ['density', 'wide', 'frozen'],
    sheets: {
      density: {
        id: 'density',
        name: 'Reading density',
        rowCount: 70,
        columnCount: 18,
        defaultRowHeight: 32,
        defaultColumnWidth: 115,
        zoomRatio: 1,
        columnData: { 0: { w: 215 }, 1: { w: 110 }, 2: { w: 110 }, 3: { w: 120 }, 4: { w: 175 } },
        cellData: density,
      },
      wide: {
        id: 'wide',
        name: 'Wide schedule',
        rowCount: 55,
        columnCount: 40,
        defaultRowHeight: 34,
        defaultColumnWidth: 115,
        zoomRatio: 1,
        columnData: { 0: { w: 225 } },
        cellData: wide,
      },
      frozen: {
        id: 'frozen',
        name: 'Frozen routes',
        rowCount: 80,
        columnCount: 36,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        zoomRatio: 1,
        columnData: { 0: { w: 130 }, 1: { w: 100 } },
        cellData: frozen,
      },
    },
  }
}
