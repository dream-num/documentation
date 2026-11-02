'use client'

import { LanguagesIcon } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, usePathname } from '@/i18n/navigation'

interface ILocaleOption {
  displayName: string
  locale: Locale
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
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={label}
            className="size-8 text-muted-foreground"
            size="icon"
            type="button"
            variant="ghost"
          />
        }
      >
        <LanguagesIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ displayName, locale }) => (
          <DropdownMenuItem key={locale} render={<Link className="justify-between" href={pathname} locale={locale} />}>
            <span>{displayName}</span>
            {locale === lang ? <span className="text-xs text-muted-foreground">{currentLabel}</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
