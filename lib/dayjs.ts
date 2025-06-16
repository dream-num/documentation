import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

export function formatLocalDate(date: Date | string, language: string): string {
  const parsedDate = dayjs(date)

  if (language === 'zh-CN') {
    return parsedDate.format('YYYY-MM-DD')
  }
  return parsedDate.format('ll')
}

export { dayjs }
