import type { TOCItemType } from 'fumadocs-core/toc'
import { TocList } from './toc-list'

export function DocsToc({
  items,
  lang,
  compact = false,
}: {
  items?: TOCItemType[]
  lang: string
  compact?: boolean
}) {
  return <TocList compact={compact} items={items} lang={lang} />
}
