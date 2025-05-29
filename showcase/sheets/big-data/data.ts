import type { ICellData, IObjectMatrixPrimitiveType, IWorkbookData } from '@univerjs/presets'

function generateWorkbookData() {
  const cellData: IObjectMatrixPrimitiveType<ICellData> = {}

  const maxIteration = 100000

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < maxIteration; j++) {
      const r = i * maxIteration + j

      if (cellData[r] === undefined) {
        cellData[r] = {}
      }

      for (let c = 0; c < 10; c++) {
        cellData[r][c] = {
          v: `${r},${c}`,
        }
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
        hidden: 0, // BooleanNumber.FALSE
        rowCount: 1000000,
        columnCount: 10,
      },
    },
  }

  return workbookData
}

export const WORKBOOK_DATA = generateWorkbookData()
