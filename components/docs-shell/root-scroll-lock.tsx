'use client'

import { useEffect } from 'react'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function RootScrollLock() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    let frame = 0

    function resetRootScroll() {
      if (!mediaQuery.matches || frame) return

      frame = window.requestAnimationFrame(() => {
        frame = 0

        if (window.scrollX !== 0 || window.scrollY !== 0) {
          window.scrollTo(0, 0)
        }
      })
    }

    resetRootScroll()
    window.addEventListener('scroll', resetRootScroll, { passive: true })
    window.addEventListener('hashchange', resetRootScroll)
    mediaQuery.addEventListener('change', resetRootScroll)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      window.removeEventListener('scroll', resetRootScroll)
      window.removeEventListener('hashchange', resetRootScroll)
      mediaQuery.removeEventListener('change', resetRootScroll)
    }
  }, [])

  return null
}
