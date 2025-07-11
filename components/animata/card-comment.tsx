import { ArrowRightIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

interface ICardCommentProps {
  title: string
  description: string
  tags: string[]
}

export function CardComment(props: ICardCommentProps) {
  const { title, description, tags } = props

  return (
    <div
      className={`
        group relative flex h-40 flex-col space-y-4 overflow-hidden rounded-md bg-neutral-50 text-black shadow-sm
        hover:shadow-lg
        dark:bg-neutral-900 dark:text-neutral-100
      `}
    >
      <div
        className={`
          h-fit p-4 transition-all
          group-hover:-translate-y-10
        `}
      >
        <div className="mb-4 h-6 w-full animate-pulse space-x-2 rounded-md text-sm">
          {tags.map(tag => (
            <label
              key={tag}
              className={clsx(`
                h-full rounded-full bg-neutral-200 px-2 py-1 text-xs font-medium transition-all duration-500 ease-in-out
                dark:bg-neutral-600
              `, {
                'bg-green-500 text-white dark:bg-green-600': tag === 'Univer Sheets',
                'bg-blue-500 text-white dark:bg-blue-600': tag === 'Univer Docs',
                'bg-red-500 text-white dark:bg-red-600': tag === 'Univer Slides',
              })}
            >
              {tag}
            </label>
          ))}
        </div>

        <h3 className="text-base font-semibold">
          {title}
        </h3>
      </div>

      <div className="absolute bottom-0 left-0 flex h-8 w-full items-center px-4">
        <div
          className={`
            h-px w-full flex-1 border-t-2 border-dashed border-neutral-400
            dark:border-neutral-600
          `}
        />
        <div
          className={`
            flex size-8 items-center justify-center rounded-full border-2 border-dashed border-neutral-400 shadow-2xl
            duration-75 ease-in-out
            group-hover:opacity-0
            dark:border-neutral-600
          `}
        >
          <div />
          <ArrowRightIcon
            className={`
              size-5 text-neutral-400
              dark:text-neutral-600
            `}
          />
        </div>
      </div>

      <div
        className={`
          w-full px-4 opacity-0 transition-all
          group-hover:-translate-y-1/3 group-hover:opacity-100
        `}
      >
        <div
          className={`
            h-40 w-full rounded-md bg-neutral-600 p-4
            dark:bg-neutral-800
          `}
        >
          <p
            className={`
              text-sm font-semibold text-white
              dark:text-neutral-100
            `}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
