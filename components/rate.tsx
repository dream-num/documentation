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
      setShowDetails(previous?.opinion === 'unhelpful' && !previous.details_submitted)
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

  function vote(opinion: IFeedback['opinion']) {
    if (feedback === undefined || isPending || feedback?.opinion === opinion) return
    feedbackId.current ??= feedback?.feedback_id ?? crypto.randomUUID()
    const value: IFeedback = {
      feedback_id: feedbackId.current,
      feedback_revision: (feedback?.feedback_revision ?? 0) + 1,
      opinion,
      message: '',
      details_submitted: opinion === 'helpful',
    }
    startTransition(async () => {
      if (!(await send('vote', value))) return
      save(value)
      setReason('')
      setMessage('')
      setShowDetails(opinion === 'unhelpful')
    })
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!feedback || isPending || (!reason && !message.trim())) return
    const value = { ...feedback, reason: reason || undefined, message: message.trim(), details_submitted: true }
    startTransition(async () => {
      if (!(await send('details', value))) return
      save(value)
      setShowDetails(false)
    })
  }

  return (
    <section aria-label={t('question')} className="border-y py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="pe-2 text-sm font-medium">{t('question')}</p>
        <Button
          type="button"
          size="sm"
          variant={feedback?.opinion === 'helpful' ? 'secondary' : 'outline'}
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
          variant={feedback?.opinion === 'unhelpful' ? 'secondary' : 'outline'}
          aria-pressed={feedback?.opinion === 'unhelpful'}
          disabled={feedback === undefined || isPending}
          onClick={() => vote('unhelpful')}
        >
          <ThumbsDownIcon aria-hidden="true" />
          {t('unhelpful')}
        </Button>
      </div>
      {feedback && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {t('thanks')}
        </p>
      )}
      {failed && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {t('error')}
        </p>
      )}
      {feedback && showDetails ? (
        <form className="mt-3 flex flex-col gap-3" onSubmit={submit}>
          {feedback.opinion === 'unhelpful' && (
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
          <label htmlFor={messageId} className="text-sm font-medium">
            {t('message')}
          </label>
          <textarea
            id={messageId}
            className="resize-y rounded-lg border bg-secondary p-3 text-sm text-secondary-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            rows={3}
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
                save({ ...feedback, details_submitted: true })
                setFailed(false)
                setShowDetails(false)
              }}
            >
              {t('skip')}
            </Button>
            <Button type="submit" disabled={isPending || (!reason && !message.trim())}>
              {t('submit')}
            </Button>
          </div>
        </form>
      ) : feedback ? (
        <Button
          className="mt-2"
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setShowDetails(true)}
        >
          {t(feedback.reason || feedback.message ? 'retry' : 'button')}
        </Button>
      ) : null}
    </section>
  )
}

export function Rate() {
  const url = usePathname()
  return <PageFeedback key={url} url={url} />
}
