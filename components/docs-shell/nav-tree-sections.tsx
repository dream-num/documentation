import type { ReactNode } from 'react'
import type { INavTreeItem } from './nav-tree'

export function NavTreeSections({
  items,
  children,
}: {
  items: INavTreeItem[]
  children: (item: INavTreeItem, heading?: INavTreeItem) => ReactNode
}) {
  const sections: { heading?: INavTreeItem; items: INavTreeItem[] }[] = []
  for (const item of items) {
    if (item.type === 'separator' || sections.length === 0) {
      sections.push({ heading: item.type === 'separator' ? item : undefined, items: [] })
    }
    sections[sections.length - 1].items.push(item)
  }

  return (
    <ul className="space-y-3">
      {sections.map((section) => (
        <li key={section.items[0].id}>
          <ul className="space-y-0.5">{section.items.map((item) => children(item, section.heading))}</ul>
        </li>
      ))}
    </ul>
  )
}
