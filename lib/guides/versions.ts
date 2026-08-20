import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import packageJson from '@/package.json'

export interface IGuideVersion {
  label: string
  value: string
  status: 'current' | 'archived'
  isCurrent: boolean
  href?: string
  locales?: readonly Locale[]
}

const currentVersion = `v${packageJson.version}`

export const guideVersions: IGuideVersion[] = [
  {
    label: currentVersion,
    value: currentVersion,
    status: 'current',
    isCurrent: true,
  },
  {
    label: 'v0.25.x',
    value: 'v0.25.x',
    status: 'archived',
    isCurrent: false,
    href: 'https://dream-num.github.io/documentation/v0.25/',
    locales: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP'],
  },
]

export function getGuideVersionHref(version: IGuideVersion, locale: string) {
  if (!version.href) return undefined

  const supportsLocale = version.locales?.some((candidate) => candidate === locale)

  if (!supportsLocale || locale === routing.defaultLocale) {
    return version.href
  }

  return `${version.href}${locale}/`
}
