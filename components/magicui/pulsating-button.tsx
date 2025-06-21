import type { ComponentProps, CSSProperties, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

interface PulsatingButtonProps
  extends ComponentProps<typeof Button> {
  pulseColor?: string
  duration?: string
}

export function PulsatingButton({
  ref,
  className,
  children,
  pulseColor = '#808080',
  duration = '1.5s',
  ...props
}: PulsatingButtonProps & { ref?: RefObject<HTMLButtonElement | null> }) {
  return (
    <Button
      ref={ref}
      className={clsx('relative', className)}
      style={
        {
          '--pulse-color': pulseColor,
          '--duration': duration,
        } as CSSProperties
      }
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div
        className={`
          absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-lg bg-inherit
        `}
      />
    </Button>
  )
}

PulsatingButton.displayName = 'PulsatingButton'
