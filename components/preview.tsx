import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

interface IPreviewProps {
  ref: RefObject<HTMLDivElement>
  code: string
}

export function Preview(props: IPreviewProps) {
  const { ref, code } = props

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventPropagation = (e: WheelEvent) => {
      e.stopPropagation()

      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1
      const isScrolledToTop = scrollTop <= 0

      if ((isScrolledToBottom && e.deltaY > 0) || (isScrolledToTop && e.deltaY < 0)) {
        e.preventDefault()
      }
    }

    container.addEventListener('wheel', preventPropagation, { passive: false })

    return () => {
      container.removeEventListener('wheel', preventPropagation)
    }
  }, [])

  return (
    <div
      className={`
        mt-6 overflow-hidden rounded-lg border border-gray-200
        dark:border-gray-800
      `}
      onWheel={e => e.stopPropagation()}
    >
      <header
        className={`
          flex flex-col gap-y-2 border-b border-gray-200 bg-white p-4
          dark:border-gray-800 dark:bg-gray-600
        `}
      >
        <div className="flex flex-row gap-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
      </header>

      <div ref={containerRef} className="univer-flex-1 univer-overflow-hidden">
        <div ref={ref} className="rounded-b-2xl-lg h-[480px] overflow-hidden" />
      </div>

      <div
        className={`
          max-h-[480px] overflow-auto text-sm
          [&>pre]:w-fit [&>pre]:min-w-full [&>pre]:px-4
        `}
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{
          __html: code,
        }}
      />
    </div>
  )
}
