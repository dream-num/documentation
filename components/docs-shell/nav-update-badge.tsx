import { useTranslations } from 'next-intl'
import { clsx } from '@/lib/clsx'
import { DOC_UPDATE_VERSION, UPDATED_DOC_PAGES } from '@/lib/docs/page-updates'
import { stripLocalePrefix } from '@/lib/locale-path'
import type { INavTreeItem } from './nav-tree'

export function NavUpdateBadge({ item }: { item: INavTreeItem }) {
  const t = useTranslations('navigation')

  function hasUpdates(candidate: INavTreeItem = item): boolean {
    if (candidate.external) return false
    return (
      Boolean(candidate.url && UPDATED_DOC_PAGES.has(stripLocalePrefix(candidate.url))) ||
      candidate.children.some(hasUpdates)
    )
  }

  if (!hasUpdates()) return null

  const description = t('updated-in-version', { version: DOC_UPDATE_VERSION })

  return (
    <span
      aria-label={description}
      title={description}
      className={clsx(
        'shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] leading-none font-medium whitespace-nowrap text-primary',
        item.children.length > 0 && '[details[open]>summary_&]:hidden',
      )}
    >
      {t('updated')}
    </span>
  )
}
