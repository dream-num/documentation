import type { ICellData, IObjectMatrixPrimitiveType, IWorkbookData } from '@univerjs/presets'

function generateWorkbookData() {
  const cellData: IObjectMatrixPrimitiveType<ICellData> = {
    0: {
      0: {
        v: 'Try using Ctrl/Cmd + F to find and replace text in this sheet.',
      },
    },
  }
  const maxIteration = 3000 // 1 Mio Zeilen insgesamt

  const firstNames = [
    'Anna',
    'Ben',
    'Clara',
    'David',
    'Emma',
    'Finn',
    'Greta',
    'Hans',
    'Ida',
    'Jonas',
  ]
  const lastNames = [
    'Müller',
    'Schmidt',
    'Schneider',
    'Fischer',
    'Weber',
    'Meyer',
    'Wagner',
    'Becker',
    'Hoffmann',
    'Schäfer',
  ]

  for (let r = 1; r < maxIteration; r++) {
    cellData[r] = {}

    // Dynamische Auswahl per Zeilenindex
    const firstName = firstNames[r % firstNames.length]
    const lastName = lastNames[r % lastNames.length]

    // Spalte 0: Vorname
    cellData[r][0] = { v: firstName }

    // Spalte 1: Nachname
    cellData[r][1] = { v: lastName }

    // Spalten 2 bis 9: originaler Inhalt
    for (let c = 2; c < 10; c++) {
      cellData[r][c] = {
        v: `${r},${c}`,
      }
    }
  }

  const workbookData: Partial<IWorkbookData> = {
    id: 'workbook-01',
    name: 'universheet',
    sheetOrder: ['sheet-01'],
    sheets: {
      'sheet-01': {
        id: 'sheet-01',
        cellData,
        name: 'Sheet1',
        hidden: 0,
        rowCount: maxIteration,
        columnCount: 10,
      },
    },
  }

  return workbookData
}

export const WORKBOOK_DATA: Partial<IWorkbookData> = generateWorkbookData()
