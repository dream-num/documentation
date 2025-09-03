'use client'

import { motion, useCycle } from 'motion/react'
import React, { useEffect, useMemo, useState } from 'react'
import { clsx } from '@/lib/clsx'

interface IProps {
  className?: string
}

// A small animated switch to hint "configurable options"
function AnimatedSwitch({ on }: { on: boolean }) {
  return (
    <div
      className={clsx(
        'relative h-4 w-8 rounded-full bg-muted/70 p-0.5',
        on ? 'bg-green-500/30' : 'bg-muted/70',
      )}
    >
      <motion.span
        layout
        className={clsx('block size-3 rounded-full transition-all', on ? 'bg-green-500' : 'bg-foreground/50')}
        style={{ x: on ? 16 : 0 }}
      />
    </div>
  )
}

// A small animated slider to imply fine-tuning
function AnimatedSlider({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted/50">
      <motion.div
        className="h-1.5 rounded-full bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      />
    </div>
  )
}

// A tiny preview grid that rearranges blocks to convey layout customizability
function LayoutPreview({ mode }: { mode: 0 | 1 | 2 }) {
  // Grid cell size (px)
  const CW = 48
  const CH = 21
  const blocks = useMemo(() => Array.from({ length: 6 }).map((_, i) => i), [])
  const layouts: Array<Array<[number, number]>> = [
    // mode 0
    [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
    // mode 1
    [[0, 0], [0, 1], [1, 1], [0, 2], [1, 0], [1, 2]],
    // mode 2
    [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2]],
  ]

  return (
    <div className="relative h-full w-full bg-muted/10">
      {blocks.map((b, i) => {
        const [gx, gy] = layouts[mode][i]
        return (
          <motion.div
            key={b}
            className={clsx(
              'absolute rounded-sm',
              i === 0 ? 'bg-blue-500/80' : 'bg-foreground/15',
            )}
            style={{ width: CW - 6, height: CH - 6 }}
            animate={{ x: gx * CW, y: gy * CH + 4, opacity: 1 }}
            initial={{ opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          />
        )
      })}
    </div>
  )
}

export default function Customizability(props: IProps) {
  const { className } = props

  const [mode, cycleMode] = useCycle<0 | 1 | 2>(0, 1, 2)
  const [switchOn, setSwitchOn] = useState(true)
  const [slider, setSlider] = useState(65)

  // Auto-cycle to demonstrate customizability without user input
  useEffect(() => {
    const id = setInterval(() => {
      cycleMode()
      setSwitchOn(s => !s)
      setSlider(v => (v > 70 ? 30 : v + 20))
    }, 2200)
    return () => clearInterval(id)
  }, [cycleMode])

  return (
    <div
      className={clsx(
        `
          relative h-full min-h-42 drop-shadow-md drop-shadow-neutral-200 transition-all
          hover:drop-shadow-neutral-300
          lg:min-h-33
          dark:drop-shadow-blue-500 dark:hover:drop-shadow-blue-600
        `,
        className,
      )}
    >

      {/* Bottom: Live preview card */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.1 }}
        className={clsx(
          `
            absolute -top-2 left-1/2 flex h-full w-1/3 min-w-32 -translate-x-2/3 flex-col gap-3 rounded-md bg-background
            p-2 shadow-md
          `,
        )}
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-2 w-1/2 rounded-md bg-muted-foreground/25" />
          <LayoutPreview mode={mode} />
        </div>
        <div className="flex w-full flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full rounded-sm bg-emerald-500 p-2"
          >
            <span className="block h-1.5 rounded-sm bg-muted" />
          </motion.div>
        </div>
      </motion.div>

      {/* Left: Controls card */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className={clsx(
          `
            absolute left-3/5 flex h-full w-1/3 min-w-32 -translate-x-1/2 flex-col gap-3 rounded-md bg-background p-2
            shadow-md
          `,
        )}
      >
        <div
          className={`
            flex items-center justify-between border-b pb-1
            dark:border-zinc-700
          `}
        >
          <span className="text-[10px] text-muted-foreground">Layout</span>
          <AnimatedSwitch on={switchOn} />
        </div>
        <div className="space-y-2">
          <div>
            <div className="mb-1 text-[10px] text-muted-foreground">Radius</div>
            <AnimatedSlider value={slider} />
          </div>
          <div>
            <div className="mb-1 text-[10px] text-muted-foreground">Spacing</div>
            <AnimatedSlider value={100 - ((slider + 20) % 100)} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
