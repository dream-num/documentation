import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { normalizeLocale } from '@/i18n/locale-config'

dayjs.extend(localizedFormat)

export function formatLocalDate(date: Date | string, language: string): string {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date)
  }

  return new Intl.DateTimeFormat(normalizeLocale(language), {
    dateStyle: 'medium',
  }).format(parsedDate)
}

export { dayjs }
