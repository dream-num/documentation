import type { IRangeArray } from './selection'

export interface IluckySheetAlternateFormatSave {
  cellrange: IRangeArray
  format: IluckySheetAlternateFormatItem
  hasRowHeader: boolean
  hasRowFooter: boolean
}

export interface IluckySheetAlternateFormatItem {
  head: {
    fc: string
    bc: string
  }
  one: {
    fc: string
    bc: string
  }
  two: {
    fc: string
    bc: string
  }
  foot: {
    fc: string
    bc: string
  }
}
