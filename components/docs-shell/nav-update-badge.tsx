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
      title={description}
      className={clsx(
        'inline-flex size-4 shrink-0 items-center justify-center',
        item.children.length > 0 && '[details[open]>summary_&]:hidden',
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
      <span className="sr-only">{description}</span>
    </span>
  )
}
