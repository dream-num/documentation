'use client'

import { CheckIcon, CopyIcon, LoaderCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

async function loadPrompt() {
  const response = await fetch('/api/sdk-prompt')
  if (!response.ok) throw new Error('SDK prompt unavailable')
  return response.text()
}

export function SdkPrompt() {
  const t = useTranslations('office')
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle')

  async function copy() {
    setStatus('loading')
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        const item = new ClipboardItem({
          'text/plain': loadPrompt().then((text) => new Blob([text], { type: 'text/plain' })),
        })
        await navigator.clipboard.write([item])
      } else {
        await navigator.clipboard.writeText(await loadPrompt())
      }
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="not-prose my-5 space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={status === 'loading'} onClick={copy}>
          {status === 'loading' ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : status === 'copied' ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
          {status === 'copied' ? t('prompt-copied') : status === 'loading' ? t('prompt-loading') : t('copy-sdk-prompt')}
        </Button>
        <a className="text-sm underline underline-offset-4" href="/api/sdk-prompt" target="_blank" rel="noreferrer">
          {t('prompt-source')}
        </a>
      </div>
      {status === 'copied' ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t('prompt-next')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          {t('prompt-error')}
        </p>
      ) : null}
    </div>
  )
}
