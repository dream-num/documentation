import { clsx } from '@/lib/clsx'

interface ISpinnerProps {
  className?: string
}

export default function Spinner({ className }: ISpinnerProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'border-muted-foreground/15 border-t-muted-foreground/70 size-7 animate-spin rounded-full border-2 motion-reduce:animate-none',
        className,
      )}
    />
  )
}
