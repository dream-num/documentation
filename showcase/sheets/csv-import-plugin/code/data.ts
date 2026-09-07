import type { IWorkbookData } from '@univerjs/presets'

export const CSV_SAMPLES = [
  {
    id: 'quoted',
    label: 'Repair intake · quoted CSV',
    delimiter: ',',
    filename: 'kestrel-intake.csv',
    text: 'Ticket,Item,Hours,Owner,Note\r\n0007,"Radio, pocket",0.5,Léa,"Needs ""A"" battery"\r\n0008,Toaster,0,Jun,"Cable checked\r\nFuse pending"\r\n0009,Desk lamp,,Mira,\r\n0010,Fan,-1,Ren,Refund\r\n',
  },
  {
    id: 'semicolon',
    label: 'Parts ledger · semicolon',
    delimiter: ';',
    filename: 'kestrel-parts.csv',
    text: '\uFEFFPart;Quantity;Unit cost;Bin\nLED-04;12;1,25;A-03\nCable;0;0,00;B-02\nSwitch;3;2,50;C-01\n',
  },
  {
    id: 'tab',
    label: 'Volunteer shifts · TSV',
    delimiter: '\t',
    filename: 'kestrel-shifts.tsv',
    text: 'Volunteer\tDay\tHours\nAya\tSaturday\t2.5\nNoé\tSunday\t3\n',
  },
  {
    id: 'literal',
    label: 'Literal text · no formula execution',
    delimiter: ',',
    filename: 'kestrel-literals.csv',
    text: 'Kind,Literal\nFormula,=1+1\nLeading zero,00042\nLong ID,12345678901234567890\nBoolean,TRUE\nDate,2026-09-04\nAt sign,@SUM(A1:A2)\n',
  },
  {
    id: 'ragged',
    label: 'Uneven rows and empty records',
    delimiter: ',',
    filename: 'kestrel-ragged.csv',
    text: 'Item,Qty,Note\nLamp,2\n\nClock,0,Ready,Extra\n   \n',
  },
  { id: 'empty', label: 'Empty input · rejection', delimiter: ',', filename: 'empty.csv', text: '' },
  {
    id: 'malformed',
    label: 'Unclosed quote · rejection',
    delimiter: ',',
    filename: 'invalid.csv',
    text: 'Item,Note\nLamp,"Unclosed note',
  },
] as const

export function createFixture(): Partial<IWorkbookData> {
  return {
    id: 'kestrel-csv',
    name: 'Kestrel repair café',
    sheetOrder: ['intake', 'reference'],
    sheets: {
      intake: {
        id: 'intake',
        name: 'Import staging',
        rowCount: 40,
        columnCount: 12,
        defaultRowHeight: 32,
        rowData: { 5: { h: 64 } },
        columnData: { 0: { w: 80 }, 1: { w: 120 }, 2: { w: 160 }, 3: { w: 110 }, 4: { w: 120 }, 5: { w: 230 } },
        cellData: {
          0: { 0: { v: 'Kestrel repair café', s: { bl: 1 } } },
          1: { 0: { v: 'Select a target, then import literal CSV text.' } },
          3: { 1: { v: 'Old intake', s: { bg: { rgb: '#fef3c7' } } }, 2: { f: '=2+3' } },
          // Native WrapStrategy.WRAP; imported CSV preserves this pre-existing style.
          5: { 5: { s: { tb: 3 } } },
          13: { 0: { v: 'Keep this footer' }, 1: { v: 'Session: September' } },
        },
      },
      reference: {
        id: 'reference',
        name: 'Reference',
        rowCount: 40,
        columnCount: 12,
        defaultRowHeight: 32,
        cellData: {
          0: { 0: { v: 'Safety checks' }, 1: { v: 'Owner' } },
          1: { 0: { v: 'Unplug before opening' }, 1: { v: 'Aya' } },
          2: { 0: { v: 'Log replaced parts' }, 1: { v: 'Noé' } },
        },
      },
    },
  }
}
