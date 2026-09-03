'use client'

import { ArrowUpRightIcon, XIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'univer-office-sdk-banner-dismissed'

export function OfficeSdkBanner() {
  const locale = useLocale()
  const t = useTranslations('office-sdk-banner')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      try {
        setIsVisible(localStorage.getItem(STORAGE_KEY) !== 'true')
      } catch {
        setIsVisible(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  function dismiss() {
    setIsVisible(false)

    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // The banner still closes for this page when browser storage is unavailable.
    }
  }

  if (!isVisible) return null

  const href =
    locale === 'zh-CN' ? 'https://office.univer.ai/zh-CN/getting-started' : 'https://office.univer.ai/getting-started'

  return (
    <div
      aria-label={t('label')}
      className="border-primary-foreground/20 bg-primary text-primary-foreground border-t"
      data-office-sdk-banner
      role="region"
    >
      <div className="relative mx-auto flex min-h-12 max-w-384 items-center justify-center px-14 py-2 text-center text-xs sm:px-16 sm:text-sm lg:px-20">
        <p className="text-pretty">
          {t('message')}{' '}
          <a
            className="focus-visible:ring-primary-foreground/70 inline-flex items-center gap-1 font-semibold underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {t('action')}
            <ArrowUpRightIcon aria-hidden className="size-3.5 shrink-0" />
          </a>
        </p>
        <Button
          aria-label={t('dismiss')}
          className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-primary-foreground/70 absolute top-1/2 right-1 size-11 -translate-y-1/2 sm:right-3 lg:right-5"
          size="icon"
          type="button"
          variant="ghost"
          onClick={dismiss}
        >
          <XIcon aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  )
}
