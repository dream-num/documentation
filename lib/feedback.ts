import { z } from 'zod'

export const feedbackReasons = ['missing', 'unclear', 'example_error', 'version_mismatch'] as const

export const storedFeedbackSchema = z.object({
  feedback_id: z.uuid(),
  feedback_revision: z.number().int().positive(),
  opinion: z.enum(['helpful', 'unhelpful']),
  reason: z.enum(feedbackReasons).optional(),
  message: z.string().trim().max(2000).default(''),
  details_submitted: z.boolean(),
})

export const feedbackSchema = storedFeedbackSchema
  .omit({ details_submitted: true })
  .extend({
    kind: z.enum(['vote', 'details']),
    url: z
      .string()
      .max(2048)
      // eslint-disable-next-line no-control-regex -- Reject URL-normalized control characters at the public action boundary.
      .regex(/^\/(?!\/)[^\\?#\u0000-\u001F\u007F]*$/),
    distinct_id: z.string().min(1).max(200).optional(),
    session_id: z.uuid().optional(),
    pageview_id: z.uuid().optional(),
  })
  .refine((value) => value.opinion === 'unhelpful' || value.reason === undefined)
  .refine((value) => value.kind === 'vote' || value.reason !== undefined || value.message.length > 0)

export type IFeedback = z.infer<typeof storedFeedbackSchema>
export type FeedbackReason = (typeof feedbackReasons)[number]
