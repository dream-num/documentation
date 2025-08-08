'use client'

import type { HTMLMotionProps } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { motion } from 'motion/react'
import { Switch as SwitchPrimitives } from 'radix-ui'
import { useCallback, useEffect, useState } from 'react'
import { clsx } from '@/lib/clsx'

type SwitchProps = ComponentProps<typeof SwitchPrimitives.Root>
  & HTMLMotionProps<'button'> & {
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    thumbIcon?: ReactNode
  }

function Switch({
  className,
  leftIcon,
  rightIcon,
  thumbIcon,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(
    props?.checked ?? props?.defaultChecked ?? false,
  )
  const [isTapped, setIsTapped] = useState(false)

  useEffect(() => {
    if (props?.checked !== undefined) setIsChecked(props.checked)
  }, [props?.checked])

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setIsChecked(checked)
      onCheckedChange?.(checked)
    },
    [onCheckedChange],
  )

  return (
    <SwitchPrimitives.Root
      {...props}
      onCheckedChange={handleCheckedChange}
      asChild
    >
      <motion.button
        data-slot="switch"
        className={clsx(
          `
            relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            focus-visible:ring-offset-background
            disabled:cursor-not-allowed disabled:opacity-50
            data-[state=checked]:justify-end data-[state=checked]:bg-primary
            data-[state=unchecked]:justify-start data-[state=unchecked]:bg-input
          `,
          className,
        )}
        whileTap="tap"
        initial={false}
        onTapStart={() => setIsTapped(true)}
        onTapCancel={() => setIsTapped(false)}
        onTap={() => setIsTapped(false)}
        {...props}
      >
        {leftIcon && (
          <motion.div
            data-slot="switch-left-icon"
            animate={
              isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
            }
            transition={{ type: 'spring', bounce: 0 }}
            className={`
              absolute top-1/2 left-1 -translate-y-1/2 text-neutral-400
              dark:text-neutral-500
              [&_svg]:size-3
            `}
          >
            {typeof leftIcon !== 'string' ? leftIcon : null}
          </motion.div>
        )}

        {rightIcon && (
          <motion.div
            data-slot="switch-right-icon"
            animate={
              isChecked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            transition={{ type: 'spring', bounce: 0 }}
            className={`
              absolute top-1/2 right-1 -translate-y-1/2 text-neutral-500
              dark:text-neutral-400
              [&_svg]:size-3
            `}
          >
            {typeof rightIcon !== 'string' ? rightIcon : null}
          </motion.div>
        )}

        <SwitchPrimitives.Thumb asChild>
          <motion.div
            data-slot="switch-thumb"
            whileTap="tab"
            className={clsx(
              `
                relative z-[1] flex items-center justify-center rounded-full bg-background text-neutral-500 shadow-lg
                ring-0
                dark:text-neutral-400
                [&_svg]:size-3
              `,
            )}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              width: 18,
              height: 18,
            }}
            animate={
              isTapped
                ? { width: 21, transition: { duration: 0.1 } }
                : { width: 18, transition: { duration: 0.1 } }
            }
          >
            {thumbIcon && typeof thumbIcon !== 'string' ? thumbIcon : null}
          </motion.div>
        </SwitchPrimitives.Thumb>
      </motion.button>
    </SwitchPrimitives.Root>
  )
}

export { Switch, type SwitchProps }
