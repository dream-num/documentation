'use client'

import { motion, useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const colors = ['#35bd4b', '#4b7dff', '#ff6b4b', '#14b8a6', '#8b5cf6', '#e5484d']

export function HeadingGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const [glow, setGlow] = useState<{ x: number; y: number; color: string } | null>(null)

  useEffect(() => {
    const container = ref.current
    const page = container?.parentElement
    if (!container || !page || reducedMotion) return

    let headings: { element: HTMLElement; y: number; color: string }[] = []

    function update() {
      const center = scrollY.get() + window.innerHeight / 2
      if (!headings.length || center < headings[0].y - window.innerHeight / 4) {
        setGlow(null)
        return
      }
      const nearest = headings.reduce((current, item) =>
        Math.abs(item.y - center) < Math.abs(current.y - center) ? item : current,
      )
      const range = document.createRange()
      range.selectNodeContents(nearest.element)
      const text = range.getBoundingClientRect()
      const bounds = container!.getBoundingClientRect()
      const next = {
        x: Math.round(text.left + text.width / 2 - bounds.left),
        y: Math.round(text.top + text.height / 2 - bounds.top),
        color: nearest.color,
      }
      setGlow((current) =>
        current?.x === next.x && current.y === next.y && current.color === next.color ? current : next,
      )
    }

    function measure() {
      if (!page) return
      headings = Array.from(page.querySelectorAll<HTMLElement>('[data-home-features] h2, #get-started-title')).map(
        (element, index) => ({
          element,
          y: element.getBoundingClientRect().top + window.scrollY,
          color: colors[index % colors.length],
        }),
      )
      update()
    }

    const observer = new ResizeObserver(measure)
    observer.observe(page)
    page.querySelectorAll('main section, main header').forEach((section) => observer.observe(section))
    const unsubscribe = scrollY.on('change', update)
    document.fonts.addEventListener('loadingdone', measure)
    return () => {
      observer.disconnect()
      unsubscribe()
      document.fonts.removeEventListener('loadingdone', measure)
    }
  }, [reducedMotion, scrollY])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-1 overflow-clip contain-[paint] motion-reduce:hidden"
    >
      {!reducedMotion && glow && (
        <motion.div
          key={glow.color}
          data-heading-glow
          className="absolute h-64 w-160 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,currentColor,transparent_68%)] blur-2xl"
          style={{ left: glow.x, top: glow.y, color: glow.color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </div>
  )
}
