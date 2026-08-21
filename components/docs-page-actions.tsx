'use client'

import { SiGithub, SiMarkdown } from '@icons-pack/react-simple-icons'
import { AlertCircleIcon, CheckIcon, CopyIcon, LoaderCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
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

  function handlePageAction(value: string | null) {
    const href = value === 'markdown' ? markdownUrl : value === 'github' ? githubUrl : null
    if (!href) return
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mt-4 inline-flex max-w-full">
      <Button
        className={clsx('min-w-0 rounded-r-none border-r-0', '[&_svg]:text-muted-foreground')}
        disabled={copyStatus === 'copying'}
        type="button"
        variant="outline"
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
      <Select value={null} onValueChange={handlePageAction}>
        <SelectTrigger aria-label={t('docs.page-actions')} className="rounded-l-none px-2" />
        <SelectContent align="end" className={clsx('w-60', 'max-w-[calc(100vw-2rem)]')}>
          <SelectItem value="markdown">
            <span className="flex items-center gap-2">
              <SiMarkdown aria-hidden="true" />
              {t('docs.view-as-markdown')}
            </span>
          </SelectItem>
          <SelectItem value="github">
            <span className="flex items-center gap-2">
              <SiGithub aria-hidden="true" />
              {t('docs.open-in-github')}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
