import type { TOCItemType } from 'fumadocs-core/toc'
import { TocList } from '@/components/docs-shell/toc-list'

export function GuidesToc({
  items,
  lang,
}: {
  items?: TOCItemType[]
  lang: string
}) {
  return <TocList items={items} lang={lang} />
}
