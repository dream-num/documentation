import type { IluckySheetAuthority } from './authority'
import type { IluckySheetborderInfo } from './border'
import type { IluckySheetConfigMerges } from './merge-cell'

// Lucky sheet config attribute
export interface IluckySheetConfig {
  merge?: IluckySheetConfigMerges // merge handdler
  // _borderInfo?: IMapluckySheetborderInfoCellForImp, //range border
  borderInfo?: IluckySheetborderInfo[]// range border
  rowlen?: IluckySheetRowAndColumnLen // every row's height
  columnlen?: IluckySheetRowAndColumnLen// every column's width
  rowhidden?: IluckySheetRowAndColumnHidden// setting be hidden rows
  colhidden?: IluckySheetRowAndColumnHidden// setting be hidden columns

  customHeight?: IluckySheetRowAndColumnHidden// user operate row height
  customWidth?: IluckySheetRowAndColumnHidden// user operate column width

  authority?: IluckySheetAuthority// Worksheet protection
}

// row length and column length interface
export interface IluckySheetRowAndColumnLen {
  [index: string]: number
}

// row and column hidden interface
export interface IluckySheetRowAndColumnHidden {
  [index: string]: number
}
