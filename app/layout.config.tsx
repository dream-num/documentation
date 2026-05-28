import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { GithubInfo } from '@/components/github-info/github-info'
import { Logo } from '@/components/logo'
import { customTranslations, i18n } from '@/lib/i18n'

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      transparentMode: 'top',
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: customTranslations[locale]['reference.title'],
        url: '/reference/classes/univer',
      },
      {
        text: customTranslations[locale]['icons.title'],
        url: '/icons',
      },
      {
        text: customTranslations[locale]['showcase.title'],
        url: '/showcase',
      },
      {
        type: 'custom',
        children: (
          <GithubInfo
            owner="dream-num"
            repo="univer"
          />
        ),
      },
    ],
    i18n,
    githubUrl: 'https://github.com/dream-num/univer',
  }
}
