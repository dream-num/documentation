import type { IIconSet } from '@univerjs/preset-sheets-conditional-formatting'
import type { IluckysheetCFIconsFormat, IluckysheetConditionFormat } from '../../common/interface/condition-format'
import { CFNumberOperator, CFRuleType, CFValueType, IIconSetType } from '@univerjs/preset-sheets-conditional-formatting'
import { generateRandomId } from '@univerjs/presets'
import { rangeArrayToRanges } from '../../common/utils/selection'

const defaultIconType = IIconSetType.threeArrows

const iconTypeMap: Record<string, IIconSetType> = {
  '0-3-0': IIconSetType.threeArrows,
  '5-3-0': IIconSetType.threeArrowsGray,
  '0-3-1': IIconSetType.threeTriangles,
  '0-4-2': IIconSetType.fourArrows,
  '0-5-3': IIconSetType.fiveArrows,
  '5-4-1': IIconSetType.fourArrowsGray,
  '5-5-2': IIconSetType.fiveArrowsGray,
  '0-3-4': IIconSetType.threeTrafficLights1,
  '5-3-4': IIconSetType.threeTrafficLights2,
  '0-3-7': IIconSetType.threeSymbols,
  '5-3-7': IIconSetType.threeSymbols2,
  '0-3-9': IIconSetType.threeStars,
  '0-3-5': IIconSetType.threeSigns,
  '0-3-8': IIconSetType.threeFlags,
  '0-5-11': IIconSetType.fiveBoxes,
  '0-5-10': IIconSetType.fiveQuarters,
  '5-4-9': IIconSetType.fourRating,
  '5-5-10': IIconSetType.fiveRating,
  '0-4-6': IIconSetType.fourRedToBlack,
  '5-4-5': IIconSetType.fourTrafficLights,
}

export function iconSetCondition(condition: IluckysheetConditionFormat) {
  const { cellrange } = condition
  const format = condition.format as IluckysheetCFIconsFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const { leftMin, len, top } = format
  const iconType = iconTypeMap[`${leftMin}-${len}-${top}`] || defaultIconType

  const config = getIconConfig(iconType)

  const rule: IIconSet = {
    type: CFRuleType.iconSet,
    config,
    isShowValue: true,
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

/**
 * Get configuration based on iconType
 *
 * @param iconType
 * @returns
 */
function getIconConfig(iconType: IIconSetType) {
  const len = getConfigLength(iconType)

  return Array.from({ length: len }, (_, i) => {
    const value = Math.round((100 / len) * (len - 1 - i))
    const iconId = getIconId(iconType, i, len)

    return {
      operator: CFNumberOperator.greaterThanOrEqual,
      value: {
        type: CFValueType.percent,
        value,
      },
      iconType,
      iconId,
    }
  })
}

/**
 * Get the config length to be configured from iconType
 * 3Arrows => 3
 * 4Arrows => 4
 *
 * @param iconType
 */
function getConfigLength(iconType: string) {
  return Number.parseInt(iconType[0])
}

/**
 * Rating icons need to be reversed
 * @param iconType
 */
function getIconId(iconType: string, i: number, len: number) {
  if (iconType === '4Rating' || iconType === '5Rating') {
    return (len - 1 - i).toString()
  }

  return i.toString()
}
