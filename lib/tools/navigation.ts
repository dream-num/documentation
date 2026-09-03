import { PaintbrushIcon } from 'lucide-react'
import { createElement } from 'react'

import type { IDocsNavigation, IDocsNavItem } from '@/lib/docs/navigation'
import { IconWrapper } from '@/components/icon-wrapper'
import { isPathActive } from '@/lib/locale-path'

export interface IToolsNavigationLabels {
  themeCustomizer: string
}

export function createToolsNavigation(pathname: string, labels: IToolsNavigationLabels): IDocsNavigation {
  const themeCustomizer = {
    id: 'theme-customizer',
    type: 'page',
    name: labels.themeCustomizer,
    url: '/tools/theme-customizer',
    icon: createElement(IconWrapper, {
      type: 'icon',
      icon: PaintbrushIcon,
    }),
    children: [],
  } satisfies IDocsNavItem

  return {
    items: [themeCustomizer],
    flatPages: [themeCustomizer],
    activeTrail: isPathActive(pathname, themeCustomizer.url) ? [themeCustomizer] : [],
  }
}
