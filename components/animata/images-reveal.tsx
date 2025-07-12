'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import React from 'react'
import { clsx } from '@/lib/clsx'

interface ICustomProps {
  index: number
  angle: string
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.2 },
  visible: (custom: ICustomProps) => ({
    opacity: 1,
    scale: 1,
    rotate: custom.angle,
    transition: {
      delay: custom.index * 0.1,
      duration: 0.3,
      type: 'spring' as const,
      stiffness: 150,
      damping: 20,
      mass: 0.5,
    },
  }),
}

interface IProps {
  className?: string
  images?: Array<{
    src: string
    angle: string
  }>
}

export default function ImagesReveal(props: IProps) {
  const { className, images = [] } = props

  return (
    <div className={clsx('relative flex size-full min-h-33 flex-row items-center justify-center', className)}>
      {images.map((card, i) => (
        <motion.div
          key={i}
          className={`
            group relative -mr-3.5 -ml-3.5 flex size-18 shrink-0 items-center justify-center rounded-lg bg-white
            object-cover shadow-md
            xl:-mr-3 xl:-ml-3 xl:size-22
            dark:bg-neutral-900
          `}
          custom={{ index: i, angle: card.angle }}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{
            scale: 1,
            rotate: '0deg',
            transition: { duration: 0.3, type: 'spring', stiffness: 150, damping: 20 },
          }}
        >
          <Image
            className={`
              size-20 rounded-lg object-cover mix-blend-luminosity brightness-80 transition-all select-none
              group-hover:mix-blend-normal group-hover:brightness-100
              dark:brightness-100
            `}
            src={card.src}
            alt="Product"
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  )
}
