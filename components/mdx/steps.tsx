import type { ComponentProps } from 'react'

import { clsx } from '@/lib/clsx'

export interface IStepProps extends ComponentProps<'li'> {
  title?: string
}

export function Step({ children, className, title, ...props }: IStepProps) {
  return (
    <li
      className={clsx(
        'after:bg-muted relative pb-10 pl-6 after:absolute after:top-7 after:bottom-1 after:-left-px after:w-0.5 after:rounded-full last:pb-0 last:after:hidden',
        className,
      )}
      {...props}
      data-slot="step"
    >
      <span
        aria-hidden="true"
        className="bg-muted text-foreground absolute top-0 -left-3 flex size-6 items-center justify-center rounded-full text-sm font-medium before:content-[counter(list-item)]"
      />
      {title ? (
        <h3 className="text-foreground mt-0 mb-1 text-base! leading-5! font-medium! tracking-normal!">{title}</h3>
      ) : null}
      <div className="text-muted-foreground text-sm leading-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </li>
  )
}

export type IStepsProps = ComponentProps<'ol'>

export function Steps({ className, ...props }: IStepsProps) {
  return <ol className={clsx('ml-3 list-none pl-0 [&>li+li]:mt-0!', className)} {...props} data-slot="steps" />
}
