import type { VariantProps } from 'class-variance-authority'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'

import { clsx } from '@/lib/clsx'

const rainbowButtonVariants = cva(
  clsx(
    'group animate-rainbow relative cursor-pointer transition-all',
    'inline-flex shrink-0 items-center justify-center gap-2',
    `aria-invalid:border-destructive rounded-sm outline-none focus-visible:ring-[3px]`,
    'text-sm font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-50',
    `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  ),
  {
    variants: {
      variant: {
        default: `
            border-0
            bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            bg-size-[200%] [background-clip:padding-box,border-box,border-box] bg-origin-border text-primary-foreground
            [border:calc(0.125rem)_solid_transparent]
            before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5
            before:-translate-x-1/2 before:animate-rainbow
            before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            before:filter-[blur(0.75rem)]
            dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          `,
        outline: `
            border border-input border-b-transparent
            bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            bg-size-[200%] [background-clip:padding-box,border-box,border-box] bg-origin-border text-accent-foreground
            before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5
            before:-translate-x-1/2 before:animate-rainbow
            before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            before:filter-[blur(0.75rem)]
            dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          `,
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type IRainbowButtonProps = useRender.ComponentProps<'button'> & VariantProps<typeof rainbowButtonVariants>

function RainbowButton({ className, variant, size, render, ...props }: IRainbowButtonProps) {
  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>({ className: clsx(rainbowButtonVariants({ variant, size, className })) }, props),
    render,
    state: { slot: 'button' },
  })
}

RainbowButton.displayName = 'RainbowButton'

export { RainbowButton, type IRainbowButtonProps, rainbowButtonVariants }
