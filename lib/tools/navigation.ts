import type { DocsNavigation, DocsNavItem } from '@/lib/docs/navigation'
import { PaintbrushIcon } from 'lucide-react'
import { createElement } from 'react'
import { IconWrapper } from '@/components/icon-wrapper'
import { withLocale } from '@/lib/locale-path'

export interface ToolsNavigationLabels {
  themeCustomizer: string
}

export function createToolsNavigation(lang: string, pathname: string, labels: ToolsNavigationLabels): DocsNavigation {
  const themeCustomizer: DocsNavItem = {
    id: 'theme-customizer',
    type: 'page',
    name: labels.themeCustomizer,
    url: withLocale(lang, '/tools/theme-customizer'),
    icon: createElement(IconWrapper, {
      type: 'icon',
      icon: PaintbrushIcon,
    }),
    children: [],
  }

  return {
    items: [themeCustomizer],
    flatPages: [themeCustomizer],
    activeTrail: pathname === themeCustomizer.url ? [themeCustomizer] : [],
  }
}
