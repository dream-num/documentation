'use client'

import { ArrowUpNarrowWideIcon, BookTextIcon, ChartPieIcon, FunnelIcon, Grid2X2CheckIcon, ImagePlusIcon, PresentationIcon, SheetIcon } from 'lucide-react'
import { useRef } from 'react'
import { BrandIcon } from '@/components/logo'
import { AnimatedBeam, Circle } from '@/components/ui-layouts/animated-beam'
import { clsx } from '@/lib/clsx'

interface IProps {
  className?: string
}

export default function Combination(props: IProps) {
  const { className } = props

  const containerRef = useRef<HTMLDivElement>(null!)
  const div1Ref = useRef<HTMLDivElement>(null!)
  const div2Ref = useRef<HTMLDivElement>(null!)
  const div3Ref = useRef<HTMLDivElement>(null!)
  const div4Ref = useRef<HTMLDivElement>(null!)
  const div5Ref = useRef<HTMLDivElement>(null!)
  const div6Ref = useRef<HTMLDivElement>(null!)
  const div7Ref = useRef<HTMLDivElement>(null!)
  const div8Ref = useRef<HTMLDivElement>(null!)
  const div9Ref = useRef<HTMLDivElement>(null!)

  return (
    <div
      ref={containerRef}
      className={clsx('relative mx-auto flex size-full items-center justify-center overflow-hidden', className)}
    >
      <div className="flex h-full w-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-3">
          <Circle
            ref={div1Ref}
            className={`
              size-11
              dark:bg-neutral-800
            `}
          >
            <FunnelIcon className="text-emerald-500" />
          </Circle>
          <Circle
            ref={div2Ref}
            className={`
              size-11
              dark:bg-neutral-800
            `}
          >
            <ArrowUpNarrowWideIcon className="text-teal-500" />
          </Circle>
          <Circle
            ref={div3Ref}
            className={`
              size-11
              dark:bg-neutral-800
            `}
          >
            <Grid2X2CheckIcon className="text-cyan-500" />
          </Circle>
          <Circle
            ref={div4Ref}
            className={`
              size-11
              dark:bg-neutral-800
            `}
          >
            <ImagePlusIcon className="text-sky-500" />
          </Circle>
          <Circle
            ref={div5Ref}
            className={`
              size-11
              dark:bg-neutral-800
            `}
          >
            <ChartPieIcon className="text-blue-500" />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <Circle
            ref={div6Ref}
            className={`
              size-16 p-0 shadow-xl
              dark:bg-neutral-800
            `}
          >
            <BrandIcon />
          </Circle>
        </div>

        <div className="flex flex-col justify-between">
          <Circle
            ref={div7Ref}
            className={`
              bg-linear-[135deg,#0DA471_0%,#F3FAF7_100%] text-white
              dark:bg-linear-[135deg,#0DA471_0%,#014737_100%]
            `}
          >
            <SheetIcon />
          </Circle>
          <Circle
            ref={div8Ref}
            className={`
              bg-linear-[135deg,#3F83F8_0%,#EBF5FF_100%] text-white
              dark:bg-linear-[135deg,#3F83F8_0%,#233876_100%]
            `}
          >
            <BookTextIcon />
          </Circle>
          <Circle
            ref={div9Ref}
            className={`
              bg-linear-[135deg,#F05252_0%,#FDF2F2_100%] text-white
              dark:bg-linear-[135deg,#F05252_0%,#771D1D_100%]
            `}
          >
            <PresentationIcon />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        dotted
        dotSpacing={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        dotted
        dotSpacing={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        dotted
        dotSpacing={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        dotted
        dotSpacing={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        dotted
        dotSpacing={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        dotted
        dotSpacing={6}
        gradientStartColor="#00c951"
        gradientStopColor="#00a63e"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div8Ref}
        dotted
        dotSpacing={6}
        gradientStartColor="#2b7fff"
        gradientStopColor="#155dfc"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div9Ref}
        dotted
        dotSpacing={6}
        gradientStartColor="#fb2c36"
        gradientStopColor="#e7000b"
      />
    </div>
  )
}
