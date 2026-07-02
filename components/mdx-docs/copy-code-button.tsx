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
      className="
        size-7 border bg-background/80 text-muted-foreground shadow-xs transition-colors
        hover:text-foreground
        focus:text-foreground
      "
      size="icon"
      type="button"
      variant="secondary"
      onClick={async () => {
        if (!code) return
        await navigator.clipboard.writeText(code)
        setCopied(true)
        window.setTimeout(setCopied, 1200, false)
      }}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </Button>
  )
}
