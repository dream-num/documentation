'use client'

import { LanguagesIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ILocaleOption {
  displayName: string
  locale: string
}

function getLocaleHref(locale: string, pathname: string, locales: ILocaleOption[]) {
  const segments = pathname.split('/').filter(Boolean)
  const currentLocale = locales.some((item) => item.locale === segments[0])

  if (currentLocale) {
    segments[0] = locale
    return `/${segments.join('/')}`
  }

  return `/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

export function SiteLanguageSwitcher({
  currentLabel,
  label,
  lang,
  locales,
}: {
  currentLabel: string
  label: string
  lang: string
  locales: ILocaleOption[]
}) {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button aria-label={label} size="icon" type="button" variant="outline" />}>
        <LanguagesIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ displayName, locale }) => (
          <DropdownMenuItem
            key={locale}
            render={<Link className="justify-between" href={getLocaleHref(locale, pathname, locales)} />}
          >
            <span>{displayName}</span>
            {locale === lang ? <span className="text-muted-foreground text-xs">{currentLabel}</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
