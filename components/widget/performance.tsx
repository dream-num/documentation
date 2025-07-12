'use client'

import type { JSX } from 'react'
import { ZapIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

export default function QuickMotionEffect() {
  const [background, setBackground] = useState<JSX.Element[]>([])

  const colors = [
    'rgba(100, 116, 139, 0.8)', // slate
    'rgba(71, 85, 105, 0.8)', // darker slate
    'rgba(148, 163, 184, 0.8)', // lighter slate
    'rgba(30, 41, 59, 0.8)', // deep slate
    'rgba(51, 65, 85, 0.8)', // slate blue
  ]

  const createElements = () => {
    const elements = []

    // Fast-moving horizontal line
    elements.push(
      <motion.div
        key="horizontal-line"
        className="absolute h-px bg-slate-400 opacity-70"
        style={{ width: '60%', top: '40%', left: 0 }}
        initial={{ scaleX: 0, x: 0 }}
        animate={{
          scaleX: [0, 1, 1, 0],
          x: ['0%', '0%', '100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />,
    )

    // Fast-moving particles
    for (let i = 0; i < 12; i++) {
      const size = Math.floor(Math.random() * 6) + 2
      const delay = Math.random() * 2
      const yPos = Math.random() * 100

      elements.push(
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            top: `${yPos}%`,
            backgroundColor: colors[i % colors.length],
          }}
          initial={{ x: '-10%', opacity: 0 }}
          animate={{
            x: '10000%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />,
      )
    }

    // Fast-expanding circles
    for (let i = 0; i < 4; i++) {
      elements.push(
        <motion.div
          key={`circle2-${i}`}
          className="absolute rounded-full border opacity-70"
          style={{
            top: '50%',
            left: `${20 + i * 20}%`,
            borderColor: colors[i % colors.length],
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{
            width: [0, 40, 0],
            height: [0, 40, 0],
            opacity: [0.7, 0.3, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />,
      )
    }

    // Fast-blinking dots
    for (let i = 0; i < 8; i++) {
      const xPos = 10 + (i * 10)
      elements.push(
        <motion.div
          key={`blink-${i}`}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            left: `${xPos}%`,
            top: `${20 + Math.random() * 60}%`,
            backgroundColor: colors[i % colors.length],
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />,
      )
    }

    // Fast-moving diagonal line
    elements.push(
      <motion.div
        key="diagonal-line"
        className="absolute bg-slate-500 opacity-50"
        style={{
          width: 1,
          height: 30,
          top: '20%',
          right: '30%',
          transformOrigin: 'top left',
          rotate: 45,
        }}
        animate={{
          x: ['0%', '4200%'],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />,
    )

    elements.push(<PerformanceVisualCompact key="center" />)

    return elements
  }

  useEffect(() => {
    setBackground(createElements())
  }, [])

  return (
    <div className="relative h-33 w-full overflow-hidden" suppressHydrationWarning>
      {background}
    </div>
  )
}

function PerformanceVisualCompact() {
  return (
    <div className="relative h-33 min-h-33 w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div
            className={`
              flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-200
              shadow-md
              dark:from-blue-800 dark:to-green-400
            `}
          >
            <ZapIcon size={24} className="text-white" />
          </div>

          {[...Array.from({ length: 3 })].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-blue-400"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 0.4, scale: 1.8 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      </div>

      {[...Array.from({ length: 5 })].map((_, i) => (
        <motion.div
          key={`flying-${i}`}
          className="absolute h-5 w-0.5 rounded-full bg-gradient-to-b from-green-200 to-blue-500"
          style={{
            left: `${Math.random() * 100}%`,
            top: '100%',
            opacity: 0.7,
            filter: 'blur(0.5px)',
          }}
          animate={{
            top: '-10%',
            opacity: [0.1, 0.7, 0.1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
