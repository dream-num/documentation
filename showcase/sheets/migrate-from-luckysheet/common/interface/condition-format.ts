import type { IluckySheetSelection } from './selection'

export interface IluckysheetConditionFormat {
  type: string // Option:defualt,databar,colorGradation,icons,
  cellrange: IluckySheetSelection[]// Valid range
  format: string[] | IluckysheetCFDefaultFormat | IluckysheetCFIconsFormat// style
  conditionName?: string | undefined// Detailed settings,comparison parameters
  conditionRange?: IluckySheetSelection[]// Detailed settings,comparison range
  conditionValue?: (number | string | object)[]// Detailed settings,comparison value
}

export interface IluckysheetCFDefaultFormat {
  textColor: string | undefined | null
  cellColor: string | undefined | null
}

export interface IluckysheetCFIconsFormat {
  len: string | number
  leftMin: string | number
  top: string | number
}
