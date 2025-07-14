import { clsx } from '@/lib/clsx'

interface IProps {
  className?: string
}

export default function Customizability(props: IProps) {
  const { className } = props

  return (
    <div
      className={clsx(`
        relative h-full min-h-42 drop-shadow-md drop-shadow-neutral-200 transition-all
        hover:drop-shadow-neutral-300
        lg:min-h-33
        dark:drop-shadow-blue-500 dark:hover:drop-shadow-blue-600
      `, className)}
    >
      <div
        className={`
          absolute left-1/2 flex h-full w-1/3 min-w-32 -translate-x-1/2 flex-col gap-3 rounded-md bg-background p-3
          shadow-md
        `}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`item-${i}`} className="flex w-full items-center justify-between gap-1">
            <div className="h-2 w-4 rounded-md bg-muted" />
            <div className="h-2 w-4 rounded-sm bg-muted" />
            <div className="h-2 w-4 rounded-sm bg-muted" />
            <div className="h-2 w-4 rounded-sm bg-muted" />
            <div className="h-2 w-4 rounded-sm bg-muted" />
            <div className="h-2 w-4 rounded-sm bg-muted" />
          </div>
        ))}
      </div>

      <div
        className={`
          absolute -top-2 left-1/2 flex h-full w-1/3 min-w-32 -translate-x-2/3 flex-col gap-3 rounded-md bg-background
          p-2 shadow-md
        `}
      >
        <div
          className={`
            flex items-center justify-end border-b pb-1
            dark:border-zinc-700
          `}
        >
          <span className="inline-block h-4 w-8 rounded-md bg-blue-600" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div className="h-2 w-full rounded-md bg-muted" key={`item-${i}`} />
        ))}
        <div className="h-2 w-1/2 rounded-md bg-muted" />
      </div>

      <div
        className={`
          absolute bottom-8 left-1/2 flex h-fit w-2/3 max-w-72 min-w-48 -translate-x-1/2 gap-3 rounded-md bg-background
          p-2 shadow-md
          lg:bottom-2
        `}
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-2 w-1/2 rounded-md bg-muted-foreground/25" />
          <div className="h-2 w-3/4 rounded-md bg-muted" />
        </div>
        <div className="w-fit flex-shrink-0">
          <div className="w-8 rounded-sm bg-green-500 p-2">
            <span className="block h-1.5 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
