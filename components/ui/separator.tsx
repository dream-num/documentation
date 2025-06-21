import type { ComponentProps } from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { clsx } from '@/lib/clsx'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={clsx(
        `
          shrink-0 bg-border
          data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full
          data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px
        `,
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
