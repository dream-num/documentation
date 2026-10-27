'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'

function getScrollParent(element: HTMLElement) {
  let parent = element.parentElement

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent
    }

    parent = parent.parentElement
  }

  return undefined
}

function scrollIntoContainerView(container: HTMLElement, item: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  const padding = 12

  if (itemRect.top < containerRect.top + padding) {
    container.scrollTop -= containerRect.top + padding - itemRect.top
    return
  }

  if (itemRect.bottom > containerRect.bottom - padding) {
    container.scrollTop += itemRect.bottom - (containerRect.bottom - padding)
  }
}

export function ActiveNavScroller() {
  const markerRef = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()

  useLayoutEffect(() => {
    const nav = markerRef.current?.closest('nav')
    const mobileMenu = nav?.closest('details')
    let frame = 0
    function revealCurrentItem() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const activeItem = nav?.querySelector<HTMLElement>('[aria-current="page"]')
        if (!activeItem?.getClientRects().length) return

        const scrollParent = getScrollParent(activeItem)
        if (scrollParent) {
          scrollIntoContainerView(scrollParent, activeItem)
        }
      })
    }
    revealCurrentItem()
    mobileMenu?.addEventListener('toggle', revealCurrentItem)

    return () => {
      window.cancelAnimationFrame(frame)
      mobileMenu?.removeEventListener('toggle', revealCurrentItem)
    }
  }, [pathname])

  return <span ref={markerRef} aria-hidden="true" hidden />
}
