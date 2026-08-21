'use client'

import { SiGithub, SiMarkdown } from '@icons-pack/react-simple-icons'
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, CopyIcon, LoaderCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { clsx } from '@/lib/clsx'

interface IDocsPageActionsProps {
  githubUrl: string
  markdownUrl: string
}

type CopyStatus = 'copied' | 'copying' | 'failed' | 'idle'

export function DocsPageActions({ githubUrl, markdownUrl }: IDocsPageActionsProps) {
  const t = useTranslations()
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const resetTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(resetTimerRef.current)
  }, [])

  const copyLabel =
    copyStatus === 'copied'
      ? t('docs.copied')
      : copyStatus === 'failed'
        ? t('docs.copy-page-failed')
        : t('docs.copy-page')

  async function handleCopyPage() {
    if (copyStatus === 'copying') return
    setCopyStatus('copying')

    const markdownBlobPromise = fetch(markdownUrl, {
      headers: {
        Accept: 'text/markdown',
      },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Failed to load ${markdownUrl}: ${response.status}`)
      return new Blob([await response.text()], { type: 'text/plain' })
    })

    try {
      if (typeof ClipboardItem === 'function' && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': markdownBlobPromise })])
      } else {
        await navigator.clipboard.writeText(await (await markdownBlobPromise).text())
      }
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }

    window.clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(setCopyStatus, 1600, 'idle')
  }

  return (
    <div className="mt-4 inline-flex max-w-full">
      <Button
        className={clsx('min-w-0 rounded-r-none shadow-none', '[&_svg]:text-muted-foreground')}
        disabled={copyStatus === 'copying'}
        size="sm"
        type="button"
        variant="secondary"
        onClick={handleCopyPage}
      >
        {copyStatus === 'copied' ? (
          <CheckIcon className="size-3.5" />
        ) : copyStatus === 'copying' ? (
          <LoaderCircleIcon className="size-3.5 animate-spin" />
        ) : copyStatus === 'failed' ? (
          <AlertCircleIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        <span aria-atomic="true" aria-live="polite" className="truncate">
          {copyLabel}
        </span>
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-label={t('docs.page-actions')}
              className={clsx('rounded-l-none border-l px-2 shadow-none', 'border-border')}
              size="sm"
              type="button"
              variant="secondary"
            />
          }
        >
          <ChevronDownIcon className={clsx('size-3.5', 'text-muted-foreground')} />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={clsx(
            'flex w-60 max-w-[calc(100vw-2rem)] flex-col rounded-xl p-2 shadow-lg backdrop-blur-lg',
            'bg-popover/95',
          )}
          sideOffset={8}
        >
          <a
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg p-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-2',
              'focus-visible:ring-ring',
            )}
            href={markdownUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            <SiMarkdown aria-hidden="true" className={clsx('size-4', 'text-muted-foreground')} />
            {t('docs.view-as-markdown')}
          </a>
          <a
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg p-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-2',
              'focus-visible:ring-ring',
            )}
            href={githubUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            <SiGithub aria-hidden="true" className={clsx('size-4', 'text-muted-foreground')} />
            {t('docs.open-in-github')}
          </a>
        </PopoverContent>
      </Popover>
    </div>
  )
}
