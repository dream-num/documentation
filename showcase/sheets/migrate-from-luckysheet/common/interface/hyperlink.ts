export interface IluckysheetHyperlink {
  [key: string]: IluckysheetHyperlinkValue
}

export interface IluckysheetHyperlinkValue {
  linkAddress: string
  linkTooltip: string
  linkType: IluckysheetHyperlinkType
  display: string
}

export type IluckysheetHyperlinkType = 'internal' | 'external'
