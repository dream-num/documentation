import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { GithubInfo } from '@/components/github-info/github-info'
import { Logo } from '@/components/logo'
import { customTranslations, i18nConfig, localizePath } from '@/lib/i18n'

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
      url: localizePath('/', locale),
      transparentMode: 'top',
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: customTranslations[locale]['reference.title'],
        url: localizePath('/reference/classes/univer', locale),
      },
      {
        text: customTranslations[locale]['icons.title'],
        url: localizePath('/icons', locale),
      },
      {
        text: customTranslations[locale]['showcase.title'],
        url: localizePath('/showcase', locale),
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
    i18n: i18nConfig,
    githubUrl: 'https://github.com/dream-num/univer',
  }
}
