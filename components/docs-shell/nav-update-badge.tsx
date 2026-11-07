import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
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
    <Badge
      variant="outline"
      title={description}
      className={clsx(
        'rounded-full border-border/70 bg-background px-1.5 py-0 text-[11px] leading-[18px] text-muted-foreground',
        item.children.length > 0 && '[details[open]>summary_&]:hidden',
      )}
    >
      <span aria-hidden="true">{t('updated')}</span>
      <span className="sr-only">{description}</span>
    </Badge>
  )
}
