import { FileJsonIcon, PaintbrushIcon, Settings2Icon } from 'lucide-react'
import { createElement } from 'react'

import type { IDocsNavigation, IDocsNavItem } from '@/lib/docs/navigation'
import { isPathActive } from '@/lib/locale-path'

export interface IToolsNavigationLabels {
  themeCustomizer: string
  snapshotInspector: string
  initializationGenerator: string
}

export function createToolsNavigation(pathname: string, labels: IToolsNavigationLabels): IDocsNavigation {
  const items: IDocsNavItem[] = [
    { id: 'theme-customizer', name: labels.themeCustomizer, icon: PaintbrushIcon },
    { id: 'snapshot-inspector', name: labels.snapshotInspector, icon: FileJsonIcon },
    { id: 'initialization-generator', name: labels.initializationGenerator, icon: Settings2Icon },
  ].map(({ id, name, icon }) => ({
    id,
    type: 'page',
    name,
    url: `/tools/${id}`,
    icon: createElement(icon, { className: 'size-4 shrink-0', 'aria-hidden': true }),
    children: [],
  }))

  return {
    items,
    flatPages: items,
    activeTrail: items.filter((item) => item.url && isPathActive(pathname, item.url)),
  }
}
