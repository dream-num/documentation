import { DataValidationOperator, DataValidationType } from '@univerjs/presets'

export const dataValidationMap: Record<string, DataValidationType> = {
  dropdown: DataValidationType.LIST,
  dropdown_multiple: DataValidationType.LIST_MULTIPLE,
  checkbox: DataValidationType.CHECKBOX,
  number: DataValidationType.WHOLE,
  number_integer: DataValidationType.WHOLE,
  number_decimal: DataValidationType.DECIMAL,
  // 'text_content': DataValidationType,
  text_length: DataValidationType.TEXT_LENGTH,
  date: DataValidationType.DATE,
  // 'validity': DataValidationType,
}

export const dataValidationOperatorMap: Record<string, DataValidationOperator> = {
  bw: DataValidationOperator.BETWEEN,
  nb: DataValidationOperator.NOT_BETWEEN,
  eq: DataValidationOperator.EQUAL,
  ne: DataValidationOperator.NOT_EQUAL,
  gt: DataValidationOperator.GREATER_THAN,
  lt: DataValidationOperator.LESS_THAN,
  gte: DataValidationOperator.GREATER_THAN_OR_EQUAL,
  lte: DataValidationOperator.LESS_THAN_OR_EQUAL,

  bf: DataValidationOperator.LESS_THAN,
  nbf: DataValidationOperator.GREATER_THAN_OR_EQUAL,
  af: DataValidationOperator.GREATER_THAN,
  naf: DataValidationOperator.LESS_THAN_OR_EQUAL,
}
