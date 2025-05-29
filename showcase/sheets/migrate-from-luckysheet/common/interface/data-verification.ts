// DataVerification
export interface IluckysheetDataVerification {
  [key: string]: IluckysheetDataVerificationValue
}

export interface IluckysheetDataVerificationValue {
  type: IluckysheetDataVerificationType
  type2: string | boolean | null
  value1: string | number | null
  value2: string | number | null
  checked: boolean
  remote: boolean
  prohibitInput: boolean
  hintShow: boolean
  hintText: string
}

export type IluckysheetDataVerificationType =
  | 'dropdown'
  | 'checkbox'
  | 'number'
  | 'number_integer'
  | 'number_decimal'
  | 'text_content'
  | 'text_length'
  | 'date'
  | 'validity'
