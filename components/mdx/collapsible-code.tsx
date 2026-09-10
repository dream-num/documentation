'use client'

import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

export function CollapsibleCode({ children, collapsible }: { children: ReactNode; collapsible: boolean }) {
  const t = useTranslations('common')
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()

  if (!collapsible) return children

  return (
    <div className="relative">
      <div
        id={contentId}
        className={clsx(
          !expanded && 'max-h-80 overflow-hidden mask-[linear-gradient(to_bottom,black_65%,transparent)]',
        )}
      >
        {children}
      </div>
      <div
        className={clsx(
          'flex justify-center px-3 py-1',
          expanded ? 'bg-background border-t border-(--separator)' : 'absolute inset-x-0 bottom-0',
        )}
      >
        <Button
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-6 gap-1 rounded-sm px-2 text-xs font-normal"
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp aria-hidden="true" className="size-3" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-3" />
          )}
          {t(expanded ? 'collapse-code' : 'expand-code')}
        </Button>
      </div>
    </div>
  )
}
