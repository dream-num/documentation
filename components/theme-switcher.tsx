'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'

const THEME_TRANSITION_DURATION = 400

export function ThemeSwitcher({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const activeAnimationRef = useRef<Animation | null>(null)
  const isTransitioningRef = useRef(false)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  useEffect(() => {
    return () => {
      activeAnimationRef.current?.cancel()

      const root = document.documentElement
      delete root.dataset.themeTransition
      root.style.removeProperty('--theme-transition-duration')
      root.style.removeProperty('--theme-transition-clip-from')
    }
  }, [])

  async function toggleTheme() {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    const button = buttonRef.current
    const root = document.documentElement
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!button || typeof document.startViewTransition !== 'function' || prefersReducedMotion) {
      setTheme(nextTheme)
      return
    }

    if (isTransitioningRef.current || root.dataset.themeTransition === 'active') {
      return
    }

    const { left, top, width, height } = button.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const x = left + width / 2
    const y = top + height / 2
    const point = `${(x / viewportWidth) * 100}% ${(y / viewportHeight) * 100}%`
    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y))
    const radius = `${(maxRadius / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`
    const clipPath = [`circle(0% at ${point})`, `circle(${radius} at ${point})`]

    function applyTheme() {
      root.classList.toggle('dark', nextTheme === 'dark')
      setTheme(nextTheme)
    }

    function cleanUpTransition() {
      isTransitioningRef.current = false
      activeAnimationRef.current?.cancel()
      activeAnimationRef.current = null
      delete root.dataset.themeTransition
      root.style.removeProperty('--theme-transition-duration')
      root.style.removeProperty('--theme-transition-clip-from')
    }

    isTransitioningRef.current = true
    root.dataset.themeTransition = 'active'
    root.style.setProperty('--theme-transition-duration', `${THEME_TRANSITION_DURATION}ms`)
    root.style.setProperty('--theme-transition-clip-from', clipPath[0])

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })

    try {
      await transition.ready
      activeAnimationRef.current = root.animate(
        { clipPath },
        {
          duration: THEME_TRANSITION_DURATION,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    } catch {
      activeAnimationRef.current = null
    }

    try {
      await transition.finished
    } catch {
      activeAnimationRef.current?.cancel()
    } finally {
      cleanUpTransition()
    }
  }

  return (
    <Button
      ref={buttonRef}
      aria-label={label}
      className="text-muted-foreground size-8"
      variant="ghost"
      size="icon"
      disabled={!mounted}
      onClick={toggleTheme}
    >
      {mounted && resolvedTheme === 'dark' ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </Button>
  )
}
