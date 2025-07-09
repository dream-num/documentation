import type { VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { clsx } from '@/lib/clsx'

interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const rainbowButtonVariants = cva(
  clsx(
    'group animate-rainbow relative cursor-pointer transition-all',
    'inline-flex shrink-0 items-center justify-center gap-2',
    `
      aria-invalid:border-destructive
      rounded-sm outline-none
      focus-visible:ring-[3px]
    `,
    'text-sm font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-50',
    `
      [&_svg]:pointer-events-none [&_svg]:shrink-0
      [&_svg:not([class*='size-'])]:size-4
    `,
  ),
  {
    variants: {
      variant: {
        default:
          `
            text-primary-foreground border-0
            bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            bg-[length:200%]
            [background-clip:padding-box,border-box,border-box]
            [background-origin:border-box]
            [border:calc(0.125rem)_solid_transparent]
            before:animate-rainbow before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5
            before:w-3/5 before:-translate-x-1/2
            before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            before:[filter:blur(0.75rem)]
            dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          `,
        outline:
          `
            border-input text-accent-foreground border border-b-transparent
            bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            bg-[length:200%]
            [background-clip:padding-box,border-box,border-box]
            [background-origin:border-box]
            before:animate-rainbow before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5
            before:w-3/5 before:-translate-x-1/2
            before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
            before:[filter:blur(0.75rem)]
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

interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof rainbowButtonVariants> {
  asChild?: boolean
}

function RainbowButton({ ref, className, variant, size, asChild = false, ...props }: RainbowButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={clsx(rainbowButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

RainbowButton.displayName = 'RainbowButton'

export { RainbowButton, type RainbowButtonProps, rainbowButtonVariants }
