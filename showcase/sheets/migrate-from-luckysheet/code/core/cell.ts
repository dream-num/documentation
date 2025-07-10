import type { ICellData, IStyleData, ITextRun, ITextStyle, IWorkbookData, IWorksheetData } from '@univerjs/presets'
import type { IluckySheetCelldataValue } from '../common/interface/cell-data'
import type { ILuckyInlineStrItem } from '../common/interface/cell-style'
import type { ILuckyJson } from '../common/interface/lucky-json'
import type { ILuckySheet } from '../common/interface/lucky-sheet'
import { CellValueType, generateRandomId, HorizontalAlign, isFormulaString, isRealNum, VerticalAlign, WrapStrategy } from '@univerjs/presets'
import { fontFamilyMap } from '../common/const/font-family'

export function cellData(workbookData: Partial<IWorkbookData>, worksheetData: Partial<IWorksheetData>, luckyJson: Partial<ILuckyJson>, sheet: Partial<ILuckySheet>) {
  // cell data
  if (sheet.celldata) {
    if (!worksheetData.cellData) {
      worksheetData.cellData = {}
    }

    for (const cellItem of sheet.celldata) {
      const { r, c } = cellItem
      if (!worksheetData.cellData[r]) {
        worksheetData.cellData[r] = {}
      }
      if (!worksheetData.cellData[r][c]) {
        worksheetData.cellData[r][c] = {}
      }

      const cell = cellItem.v
      const newCell: ICellData = worksheetData.cellData[r][c]
      covertCell(newCell, cell)
    }
  }
}

export function covertCell(newCell: ICellData, cell: Partial<IluckySheetCelldataValue> | string | null) {
  if (cell === null) return

  if (typeof cell === 'string') {
    newCell.v = cell
    return
  }

  // rich text
  if (cell?.ct?.t === 'inlineStr') {
    const textRuns: ITextRun[] = []
    let dataStream = ''
    const richTextList = cell.ct.s

    if (!richTextList) {
      return
    }

    let ed = 0
    richTextList.forEach((inlineStrItem: Partial<ILuckyInlineStrItem>) => {
      const textStyle: ITextStyle = {}
      covertInlineStyle(textStyle, inlineStrItem)

      const content = replaceNewlines(String(inlineStrItem.v)) || ''
      dataStream += content

      const st = ed
      ed = st + content.length

      textRuns.push({
        st,
        ed,
        ts: textStyle,
      })
    })

    dataStream += '\r\n'

    newCell.p = {
      id: generateRandomId(6),
      body: {
        dataStream,
        textRuns,
      },
      documentStyle: {},
    }
  }

  // content
  if (cell.v !== undefined) {
    let v = cell.v
    newCell.v = cell.v

    if (typeof v === 'boolean') {
      v = v ? 1 : 0
      newCell.t = CellValueType.BOOLEAN
    } else if (isNumberCell(cell)) {
      newCell.t = CellValueType.NUMBER
      newCell.v = Number(v)
    }
  } else if (cell.m !== undefined) {
    newCell.v = cell.m
  }

  // formula, but not sparkline
  if (isFormulaString(cell.f) && !cell.spl) {
    newCell.f = cell.f
  }

  const cellStyle: IStyleData = {}

  covertInlineStyle(cellStyle, cell)
  covertCellStyle(cellStyle, cell)

  newCell.s = Object.assign(newCell.s || {}, cellStyle)
}

export function covertInlineStyle(textStyle: ITextStyle, inlineStrItem: Partial<ILuckyInlineStrItem>) {
  // font family
  if (inlineStrItem.ff !== undefined) {
    textStyle.ff = fontFamilyMap[inlineStrItem.ff]
  }

  // font color
  if (inlineStrItem.fc !== undefined) {
    textStyle.cl = {
      rgb: inlineStrItem.fc,
    }
  }

  // font size
  if (inlineStrItem.fs !== undefined) {
    textStyle.fs = Number(inlineStrItem.fs)
  }

  // bold
  if (inlineStrItem.bl !== undefined) {
    textStyle.bl = inlineStrItem.bl
  }

  // italic
  if (inlineStrItem.it !== undefined) {
    textStyle.it = inlineStrItem.it
  }

  // strikethrough
  if (inlineStrItem.cl !== undefined) {
    textStyle.st = {
      s: inlineStrItem.cl,
    }
  }

  // underline
  if (inlineStrItem.un !== undefined) {
    textStyle.ul = {
      s: inlineStrItem.un,
    }
  }
}

export function covertCellStyle(cellStyle: IStyleData, cell: Partial<IluckySheetCelldataValue>) {
  // background color
  if (cell.bg !== undefined) {
    cellStyle.bg = {
      rgb: cell.bg,
    }
  }

  // vertical align
  if (cell.vt !== undefined) {
    switch (String(cell.vt)) {
      case '0':
        cellStyle.vt = VerticalAlign.MIDDLE
        break
      case '1':
        cellStyle.vt = VerticalAlign.TOP
        break
      case '2':
        cellStyle.vt = VerticalAlign.BOTTOM
        break

      default:
        break
    }
  }

  // horizontal align
  if (cell.ht !== undefined) {
    switch (String(cell.ht)) {
      case '0':
        cellStyle.ht = HorizontalAlign.CENTER
        break
      case '1':
        cellStyle.ht = HorizontalAlign.LEFT
        break
      case '2':
        cellStyle.ht = HorizontalAlign.RIGHT
        break

      default:
        break
    }
  }

  // vertical text
  if (cell.tr !== undefined) {
    switch (cell.tr) {
      case '0':
        cellStyle.tr = {
          a: 0,
          v: 0,
        }
        break

      case '1':
        cellStyle.tr = {
          a: -45,
          v: 0,
        }
        break

      case '2':
        cellStyle.tr = {
          a: 45,
          v: 0,
        }
        break

      case '3':
        cellStyle.tr = {
          a: 0,
          v: 1,
        }
        break

      case '4':
        cellStyle.tr = {
          a: -90,
          v: 0,
        }
        break

      case '5':
        cellStyle.tr = {
          a: 90,
          v: 0,
        }
        break

      default:
        break
    }
  }

  // text wrap
  if (cell.tb !== undefined) {
    switch (String(cell.tb)) {
      case '0':
        cellStyle.tb = WrapStrategy.CLIP
        break
      case '1':
        cellStyle.tb = WrapStrategy.OVERFLOW
        break
      case '2':
        cellStyle.tb = WrapStrategy.WRAP
        break

      default:
        break
    }
  }

  // number format
  if (cell.ct?.fa !== undefined) {
    cellStyle.n = {
      pattern: getPattern(cell.ct.fa),
    }
  }
}

function replaceNewlines(input: string): string {
  return input.replace(/\n/g, '\r')
}

function isNumberCell(cell: Partial<IluckySheetCelldataValue>): boolean {
  const v = cell.v
  const isNumber = typeof v === 'number'
  const isNumberCellType = cell.ct?.t === 'n' && v !== undefined && isRealNum(v)
  return isNumber || isNumberCellType
}

/**
 * Text format is @@@ in Univer
 * @param format
 * @returns
 */
function getPattern(format: string) {
  return format === '@' ? '@@@' : format
}
