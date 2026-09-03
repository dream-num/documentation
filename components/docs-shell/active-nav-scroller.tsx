'use client'

import { useLayoutEffect, useRef } from 'react'

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

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nav = markerRef.current?.closest('nav')
      const activeItem = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!activeItem) return

      const scrollParent = getScrollParent(activeItem)
      if (scrollParent) {
        scrollIntoContainerView(scrollParent, activeItem)
        return
      }

      activeItem.scrollIntoView({ block: 'nearest' })
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return <span ref={markerRef} aria-hidden="true" hidden />
}
