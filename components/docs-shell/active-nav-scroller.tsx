'use client'

import type { RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'

export function ActiveNavScroller({
  activeItemRef,
  navRef,
}: {
  activeItemRef: RefObject<HTMLAnchorElement | null>
  navRef: RefObject<HTMLElement | null>
}) {
  const pathname = usePathname()
  const frameRef = useRef(0)

  useLayoutEffect(() => {
    const mobileMenu = navRef.current?.closest('details')
    function revealCurrentItem() {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = window.requestAnimationFrame(() => {
        const activeItem = activeItemRef.current
        if (!activeItem?.getClientRects().length) return

        let parent = activeItem.parentElement
        while (parent) {
          const { overflowY, scrollPaddingTop } = window.getComputedStyle(parent)
          if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
            const containerRect = parent.getBoundingClientRect()
            const itemRect = activeItem.getBoundingClientRect()
            const padding = 12
            const topPadding = Math.max(padding, Number.parseFloat(scrollPaddingTop) || 0)
            if (itemRect.top < containerRect.top + topPadding) {
              parent.scrollTop -= containerRect.top + topPadding - itemRect.top
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
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      mobileMenu?.removeEventListener('toggle', revealCurrentItem)
    }
  }, [pathname, activeItemRef, navRef])

  return null
}
