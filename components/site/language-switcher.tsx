'use client'

import { LanguagesIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LocaleOption {
  displayName: string
  locale: string
}

function getLocaleHref(locale: string, pathname: string, locales: LocaleOption[]) {
  const segments = pathname.split('/').filter(Boolean)
  const currentLocale = locales.some(item => item.locale === segments[0])

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
  locales: LocaleOption[]
}) {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={label}
          size="icon"
          type="button"
          variant="outline"
        >
          <LanguagesIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ displayName, locale }) => (
          <DropdownMenuItem asChild key={locale}>
            <Link className="justify-between" href={getLocaleHref(locale, pathname, locales)}>
              <span>{displayName}</span>
              {locale === lang ? <span className="text-xs text-muted-foreground">{currentLabel}</span> : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
