'use client'

import { CheckIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function FileActions({
  content,
  name,
  downloadLabel,
  showCopy = true,
}: {
  content: string
  name: string
  downloadLabel?: string
  showCopy?: boolean
}) {
  const t = useTranslations('tools')
  const [status, setStatus] = useState('')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setStatus(t('copied'))
    } catch {
      setStatus(t('copy-error'))
    }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showCopy && (
        <Button size="sm" variant="outline" onClick={copy}>
          {status === t('copied') ? <CheckIcon /> : <CopyIcon />}
          {t('copy')}
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={download}>
        <DownloadIcon />
        {downloadLabel ?? name}
      </Button>
      <span role="status" className="text-muted-foreground text-xs">
        {status}
      </span>
    </div>
  )
}
