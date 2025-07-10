import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Logo } from '@/components/logo'
import { i18n } from '@/lib/i18n'

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      transparentMode: 'top',
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
    i18n,
    githubUrl: 'https://github.com/dream-num/univer',
  }
}
