'use client'

import type { SyntheticEvent } from 'react'
import { cva } from 'class-variance-authority'
import { MessageCircleMoreIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { clsx } from '@/lib/clsx'

const rateButtonVariants = cva(
  `
    inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm font-medium
    disabled:cursor-not-allowed
    [&_svg]:size-3
  `,
  {
    variants: {
      active: {
        true: `
          bg-accent text-accent-foreground
          [&_svg]:fill-current
        `,
        false: 'text-muted-foreground',
      },
    },
  },
)

export interface IFeedback {
  opinion: 'normal'
  url?: string
  message: string
}

export interface IActionResponse {
  githubUrl: string
}

interface Result extends IFeedback {
  response?: IActionResponse
}

export function Rate({
  onRateAction,
}: {
  lang: string
  onRateAction: (url: string, feedback: IFeedback) => void
}) {
  const t = useTranslations()
  const url = usePathname()
  const [previous, setPrevious] = useState<Result | null>(null)
  const [opinion, setOpinion] = useState<'normal' | null>(null)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const item = localStorage.getItem(`docs-feedback-${url}`)

    if (item === null) return

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setPrevious(JSON.parse(item) as Result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [url])

  useEffect(() => {
    const key = `docs-feedback-${url}`

    if (previous) localStorage.setItem(key, JSON.stringify(previous))
    else localStorage.removeItem(key)
  }, [previous, url])

  function submit(e?: SyntheticEvent) {
    if (opinion == null) return

    startTransition(async () => {
      const feedback: IFeedback = {
        opinion,
        message,
      }

      onRateAction(url, feedback)

      setPrevious({
        ...feedback,
      })
      setMessage('')
      setOpinion(null)
    })

    e?.preventDefault()
  }

  const activeOpinion = previous?.opinion ?? opinion

  return (
    <Collapsible
      className="border-y py-3"
      open={opinion !== null || previous !== null}
      onOpenChange={(v) => {
        if (!v) setOpinion(null)
      }}
    >
      <div className="flex flex-row items-center gap-2">
        <p className="pe-2 text-sm font-medium">
          {t('docs.feedback.question')}
        </p>
        <button
          className={clsx(
            rateButtonVariants({
              active: activeOpinion === 'normal',
            }),
          )}
          type="button"
          disabled={previous !== null}
          onClick={() => {
            setOpinion('normal')
          }}
        >
          <MessageCircleMoreIcon />
          {t('docs.feedback.button')}
        </button>
      </div>

      <CollapsibleContent className="mt-3">
        {previous
          ? (
              <div
                className={`
                  flex flex-col items-center gap-3 rounded-xl bg-card px-3 py-6 text-center text-sm
                  text-muted-foreground
                `}
              >
                <p className="m-0">{t('docs.feedback.thanks')}</p>
                <div className="flex flex-row items-center gap-2">
                  <Button
                    className="text-xs"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setOpinion(previous.opinion)
                      setPrevious(null)
                    }}
                  >
                    {t('docs.feedback.retry')}
                  </Button>
                </div>
              </div>
            )
          : (
              <form className="flex flex-col gap-3" onSubmit={submit}>
                <textarea
                  className={`
                    resize-none rounded-lg border bg-secondary p-3 text-secondary-foreground
                    placeholder:text-muted-foreground
                    focus-visible:outline-none
                  `}
                  value={message}
                  placeholder={t('docs.feedback.message')}
                  autoFocus
                  required
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (!e.shiftKey && e.key === 'Enter') {
                      submit(e)
                    }
                  }}
                />
                <Button
                  className="w-fit self-end"
                  type="submit"
                  disabled={isPending}
                >
                  {t('docs.feedback.submit')}
                </Button>
              </form>
            )}
      </CollapsibleContent>
    </Collapsible>
  )
}
