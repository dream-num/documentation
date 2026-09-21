'use client'

import * as BaseCheckbox from '@base-ui/react/checkbox'
import { CheckIcon } from 'lucide-react'

import { clsx } from '@/lib/clsx'

function Checkbox({ className, ...props }: BaseCheckbox.Checkbox.Root.Props) {
  return (
    <BaseCheckbox.Checkbox.Root
      data-slot="checkbox"
      className={clsx(
        'peer border-input group-has-[:focus-visible]/field-label:not-data-checked:border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Checkbox.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </BaseCheckbox.Checkbox.Indicator>
    </BaseCheckbox.Checkbox.Root>
  )
}

export { Checkbox }
