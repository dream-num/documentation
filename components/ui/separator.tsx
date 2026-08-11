import * as BaseSeparator from '@base-ui/react/separator'

import { clsx } from '@/lib/clsx'

function Separator({ className, orientation = 'horizontal', ...props }: BaseSeparator.Separator.Props) {
  return (
    <BaseSeparator.Separator
      data-slot="separator"
      orientation={orientation}
      className={clsx(
        `bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch`,
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
