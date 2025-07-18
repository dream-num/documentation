import type {
  IAverageHighlightCell,
  IDuplicateValuesHighlightCell,
  INumberHighlightCell,
  IRankHighlightCell,
  ITextHighlightCell,
  IUniqueValuesHighlightCell,
} from '@univerjs/preset-sheets-conditional-formatting'
import type { IluckysheetCFDefaultFormat, IluckysheetConditionFormat } from '../../common/interface/condition-format'
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator } from '@univerjs/preset-sheets-conditional-formatting'
import { generateRandomId } from '@univerjs/presets'
import { rangeArrayToRanges } from '../../common/utils/selection'

export function defaultCondition(condition: IluckysheetConditionFormat) {
  const { conditionName } = condition

  let conditionalFormattingInfo = null

  switch (conditionName) {
    case 'greaterThan':
    case 'lessThan':
    case 'equal':
      conditionalFormattingInfo = numberCompare(condition)
      break
    case 'betweenness':
      conditionalFormattingInfo = betweenness(condition)
      break

    case 'textContains':
      conditionalFormattingInfo = textContains(condition)
      break
      // case 'occurrenceDate':
      //     // not support
      //     break;
    case 'duplicateValue':
      conditionalFormattingInfo = duplicateValue(condition)
      break
    case 'top10':
    case 'top10%':
    case 'last10':
    case 'last10%':
      conditionalFormattingInfo = topLast(condition)
      break
    case 'AboveAverage':
    case 'SubAverage': //
      conditionalFormattingInfo = average(condition)
      break
    default:
      break
  }

  return conditionalFormattingInfo
}

function numberCompare(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionValue, conditionName } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const rule: INumberHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.number,
    operator: getNumberOperator(conditionName),
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
    value: (conditionValue as [number] || [])[0],
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function getNumberOperator(conditionName: string | undefined) {
  switch (conditionName) {
    case 'greaterThan':
      return CFNumberOperator.greaterThan
    case 'lessThan':
      return CFNumberOperator.lessThan
    case 'equal':
      return CFNumberOperator.equal
    default:
      return CFNumberOperator.equal
  }
}

function betweenness(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionValue } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const rule: INumberHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.number,
    operator: CFNumberOperator.between,
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
    value: conditionValue as [number, number] || [],
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function textContains(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionValue } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const rule: ITextHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.text,
    operator: CFTextOperator.containsText,
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
    value: (conditionValue as [string] || [])[0],
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function duplicateValue(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionValue } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const isUnique = conditionValue?.[0] === 1 || conditionValue?.[0] === '1'

  const rule: IUniqueValuesHighlightCell | IDuplicateValuesHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: isUnique ? CFSubRuleType.uniqueValues : CFSubRuleType.duplicateValues,
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function average(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionName } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const operator = getAverageOperator(conditionName)

  const rule: IAverageHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.average,
    operator,
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function getAverageOperator(conditionName: string | undefined) {
  switch (conditionName) {
    case 'AboveAverage':
      return CFNumberOperator.greaterThan
    case 'SubAverage':
      return CFNumberOperator.lessThan
    default:
      return CFNumberOperator.greaterThan
  }
}

function topLast(condition: IluckysheetConditionFormat) {
  const { cellrange, conditionName, conditionValue } = condition
  const format = condition.format as IluckysheetCFDefaultFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const { value, isPercent, isBottom } = getRankInfo(conditionName, conditionValue)

  const rule: IRankHighlightCell = {
    type: CFRuleType.highlightCell,
    subType: CFSubRuleType.rank,
    isPercent,
    isBottom,
    value,
    style: {
      cl: {
        rgb: format.textColor,
      },
      bg: {
        rgb: format.cellColor,
      },
    },
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

function getRankInfo(conditionName: string | undefined, conditionValue: (string | number | object)[] | undefined) {
  const value = Number.parseFloat((conditionValue as [string] || [])?.[0])
  let isPercent = false
  let isBottom = false
  switch (conditionName) {
    case 'top10':
      isPercent = false
      isBottom = false
      break
    case 'top10%':
      isPercent = true
      isBottom = false
      break
    case 'last10':
      isPercent = false
      isBottom = true
      break
    case 'last10%':
      isPercent = true
      isBottom = true
      break
    default:
      break
  }

  return {
    value,
    isPercent,
    isBottom,
  }
}
