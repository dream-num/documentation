'use client'

import type { SyntheticEvent } from 'react'
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { posthog } from 'posthog-js'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import type { FeedbackReason, IFeedback } from '@/lib/feedback'
import { Button } from '@/components/ui/button'
import { feedbackReasons, storedFeedbackSchema } from '@/lib/feedback'
import { submitFeedback } from '@/lib/feedback-action'

function PageFeedback({ url }: { url: string }) {
  const t = useTranslations('docs.feedback')
  const [feedback, setFeedback] = useState<IFeedback | null>()
  const [reason, setReason] = useState<FeedbackReason | ''>('')
  const [message, setMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const feedbackId = useRef<string>(undefined)
  const messageId = useId()

  useEffect(() => {
    let previous: IFeedback | null = null
    try {
      const parsed = storedFeedbackSchema.safeParse(JSON.parse(localStorage.getItem(`docs-feedback-${url}`) ?? 'null'))
      if (parsed.success) previous = parsed.data
    } catch {
      // Feedback remains usable when browser storage is unavailable.
    }
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setFeedback(previous)
      setReason(previous?.reason ?? '')
      setMessage(previous?.message ?? '')
    })
    return () => {
      cancelled = true
    }
  }, [url])

  function save(value: IFeedback) {
    setFeedback(value)
    try {
      localStorage.setItem(`docs-feedback-${url}`, JSON.stringify(value))
    } catch {
      // A storage failure must not discard a successful submission.
    }
  }

  async function send(kind: 'vote' | 'details', value: IFeedback) {
    setFailed(false)
    try {
      const result = await submitFeedback({
        ...value,
        kind,
        url,
        distinct_id: posthog.get_distinct_id() || undefined,
        session_id: posthog.get_session_id() || undefined,
        pageview_id: posthog.getPageViewId(),
      })
      if (result.ok) return true
    } catch {
      // Retain the draft so a failed request can be retried.
    }
    setFailed(true)
    return false
  }

  function vote(opinion: 'helpful' | 'unhelpful') {
    if (feedback === undefined || isPending || feedback?.opinion === opinion) return
    feedbackId.current ??= feedback?.feedback_id ?? crypto.randomUUID()
    const value: IFeedback = {
      feedback_id: feedbackId.current,
      feedback_revision: (feedback?.feedback_revision ?? 0) + 1,
      opinion,
      message: '',
    }
    startTransition(async () => {
      if (!(await send('vote', value))) return
      save(value)
      setReason('')
    })
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (feedback === undefined || isPending || (!reason && !message.trim())) return
    feedbackId.current ??= feedback?.feedback_id ?? crypto.randomUUID()
    const value: IFeedback = {
      feedback_id: feedbackId.current,
      feedback_revision: feedback?.feedback_revision ?? 1,
      opinion: feedback?.opinion ?? 'unrated',
      reason: feedback?.opinion === 'unhelpful' && reason ? reason : undefined,
      message: message.trim(),
    }
    startTransition(async () => {
      if (!(await send('details', value))) return
      save(value)
      setShowDetails(false)
    })
  }

  return (
    <section aria-label={t('question')} aria-busy={isPending} className="border-y py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="w-full text-sm text-muted-foreground sm:w-auto">{t('question')}</p>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={feedback?.opinion === 'helpful' ? 'secondary' : 'ghost'}
            aria-pressed={feedback?.opinion === 'helpful'}
            disabled={feedback === undefined || isPending}
            onClick={() => vote('helpful')}
          >
            <ThumbsUpIcon aria-hidden="true" />
            {t('helpful')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedback?.opinion === 'unhelpful' ? 'secondary' : 'ghost'}
            aria-pressed={feedback?.opinion === 'unhelpful'}
            disabled={feedback === undefined || isPending}
            onClick={() => vote('unhelpful')}
          >
            <ThumbsDownIcon aria-hidden="true" />
            {t('unhelpful')}
          </Button>
          <Button
            className="text-muted-foreground"
            type="button"
            variant="ghost"
            size="sm"
            disabled={feedback === undefined || isPending}
            aria-expanded={showDetails}
            onClick={() => {
              setFailed(false)
              setShowDetails(!showDetails)
            }}
          >
            {t(feedback?.opinion === 'unhelpful' ? 'explain' : 'button')}
          </Button>
        </div>
        {feedback && !showDetails && (
          <p role="status" className="text-xs text-muted-foreground">
            {t('thanks')}
          </p>
        )}
      </div>
      {failed && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {t('error')}
        </p>
      )}
      {showDetails && (
        <form className="mt-3 flex flex-col gap-3" onSubmit={submit}>
          {feedback?.opinion === 'unhelpful' && (
            <fieldset disabled={isPending}>
              <legend className="mb-2 text-sm font-medium">{t('reason')}</legend>
              <div className="flex flex-wrap gap-2">
                {feedbackReasons.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={reason === value ? 'secondary' : 'outline'}
                    aria-pressed={reason === value}
                    onClick={() => setReason(reason === value ? '' : value)}
                  >
                    {t(`reasons.${value}`)}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}
          <label htmlFor={messageId} className="sr-only">
            {t('message')}
          </label>
          <textarea
            id={messageId}
            className="resize-y rounded-lg border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            rows={2}
            maxLength={2000}
            disabled={isPending}
            value={message}
            placeholder={t('placeholder')}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setFailed(false)
                setShowDetails(false)
              }}
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={isPending || (!reason && !message.trim())}>
              {t('submit')}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

export function Rate() {
  const url = usePathname()
  return <PageFeedback key={url} url={url} />
}
