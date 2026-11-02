import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'

export interface IStepProps extends ComponentProps<'li'> {
  title?: string
}

export function Step({ children, className, title, ...props }: IStepProps) {
  return (
    <li
      className={clsx(
        'relative pb-10 pl-6 after:absolute after:top-7 after:bottom-1 after:-left-px after:w-0.5 after:rounded-full after:bg-muted last:pb-0 last:after:hidden',
        className,
      )}
      {...props}
      data-slot="step"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 -left-3 flex size-6 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground before:content-[counter(list-item)]"
      />
      {title ? (
        <h3 className="mt-0 mb-1 text-base! leading-5! font-medium! tracking-normal! text-foreground">{title}</h3>
      ) : null}
      <div className="text-sm leading-5 text-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </li>
  )
}

export type IStepsProps = ComponentProps<'ol'>

export function Steps({ className, ...props }: IStepsProps) {
  return <ol className={clsx('ml-3 list-none pl-0 [&>li+li]:mt-0!', className)} {...props} data-slot="steps" />
}
