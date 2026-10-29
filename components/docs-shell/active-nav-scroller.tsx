'use client'

import type { RefObject } from 'react'
import { useLayoutEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

export function ActiveNavScroller({
  activeItemRef,
  navRef,
}: {
  activeItemRef: RefObject<HTMLAnchorElement | null>
  navRef: RefObject<HTMLElement | null>
}) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const mobileMenu = navRef.current?.closest('details')
    let frame = 0
    function revealCurrentItem() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const activeItem = activeItemRef.current
        if (!activeItem?.getClientRects().length) return

        let parent = activeItem.parentElement
        while (parent) {
          const { overflowY } = window.getComputedStyle(parent)
          if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
            const containerRect = parent.getBoundingClientRect()
            const itemRect = activeItem.getBoundingClientRect()
            const padding = 12
            if (itemRect.top < containerRect.top + padding) {
              parent.scrollTop -= containerRect.top + padding - itemRect.top
            } else if (itemRect.bottom > containerRect.bottom - padding) {
              parent.scrollTop += itemRect.bottom - (containerRect.bottom - padding)
            }
            break
          }
          parent = parent.parentElement
        }
      })
    }
    revealCurrentItem()
    mobileMenu?.addEventListener('toggle', revealCurrentItem)

    return () => {
      window.cancelAnimationFrame(frame)
      mobileMenu?.removeEventListener('toggle', revealCurrentItem)
    }
  }, [pathname, activeItemRef, navRef])

  return null
}
