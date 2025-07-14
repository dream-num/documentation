'use client'

import type { SyntheticEvent } from 'react'
import { cva } from 'class-variance-authority'
import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { Collapsible, CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'

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
          bg-fd-accent text-fd-accent-foreground
          [&_svg]:fill-current
        `,
        false: 'text-fd-muted-foreground',
      },
    },
  },
)

export interface IFeedback {
  opinion: 'good' | 'bad'
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
  lang,
  onRateAction,
}: {
  lang: string
  onRateAction: (url: string, feedback: IFeedback) => void
}) {
  const url = usePathname()
  const [previous, setPrevious] = useState<Result | null>(null)
  const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const item = localStorage.getItem(`docs-feedback-${url}`)

    if (item === null) return
    setPrevious(JSON.parse(item) as Result)
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
      open={opinion !== null || previous !== null}
      onOpenChange={(v) => {
        if (!v) setOpinion(null)
      }}
      className="border-y py-3"
    >
      <div className="flex flex-row items-center gap-2">
        <p className="pe-2 text-sm font-medium">
          {customTranslations[lang]['docs.feedback.question']}
        </p>
        <button
          className={clsx(
            rateButtonVariants({
              active: activeOpinion === 'good',
            }),
          )}
          type="button"
          disabled={previous !== null}
          onClick={() => {
            setOpinion('good')
          }}
        >
          <ThumbsUp />
          {customTranslations[lang]['docs.feedback.good']}
        </button>
        <button
          className={clsx(
            rateButtonVariants({
              active: activeOpinion === 'bad',
            }),
          )}
          type="button"
          disabled={previous !== null}
          onClick={() => {
            setOpinion('bad')
          }}
        >
          <ThumbsDown />
          {customTranslations[lang]['docs.feedback.bad']}
        </button>
      </div>

      <CollapsibleContent className="mt-3">
        {previous
          ? (
              <div
                className={`
                  flex flex-col items-center gap-3 rounded-xl bg-fd-card px-3 py-6 text-center text-sm
                  text-fd-muted-foreground
                `}
              >
                <p className="m-0">{customTranslations[lang]['docs.feedback.thanks']}</p>
                <div className="flex flex-row items-center gap-2">
                  <button
                    className={clsx(
                      buttonVariants({
                        color: 'secondary',
                      }),
                      'text-xs',
                    )}
                    type="button"
                    onClick={() => {
                      setOpinion(previous.opinion)
                      setPrevious(null)
                    }}
                  >
                    {customTranslations[lang]['docs.feedback.retry']}
                  </button>
                </div>
              </div>
            )
          : (
              <form className="flex flex-col gap-3" onSubmit={submit}>
                <textarea
                  className={`
                    resize-none rounded-lg border bg-fd-secondary p-3 text-fd-secondary-foreground
                    placeholder:text-fd-muted-foreground
                    focus-visible:outline-none
                  `}
                  value={message}
                  placeholder={customTranslations[lang]['docs.feedback.message']}
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
                  {customTranslations[lang]['docs.feedback.submit']}
                </Button>
              </form>
            )}
      </CollapsibleContent>
    </Collapsible>
  )
}
