'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function CopyCodeButton({ code }: { code: string }) {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  return (
    <Button
      aria-label={t('common.copy-code')}
      className="text-muted-foreground size-8 transition-colors"
      size="icon"
      type="button"
      variant="ghost"
      onClick={async () => {
        if (!code) return
        try {
          await navigator.clipboard.writeText(code)
        } catch {
          setCopied(false)
          return
        }
        setCopied(true)
        window.setTimeout(setCopied, 1200, false)
      }}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </Button>
  )
}
