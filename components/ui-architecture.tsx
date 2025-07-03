'use client'

import { useState } from 'react'
import { clsx } from '@/lib/clsx'

export function UIArchitecture() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="text-center text-sm text-neutral-600 select-none">
      <div className="relative">
        <div
          className={clsx(`
            relative grid gap-2 rounded-md border p-2 shadow transition-all duration-500
            [&_div]:border [&_div]:p-2
          `, {
            'z-1 bg-white [&_div]:transition-all [&_div]:hover:border-blue-500': activeIndex === 0,
            'translate-x-4 -translate-y-4 cursor-pointer bg-neutral-100': activeIndex !== 0,
          })}
          onClick={() => setActiveIndex(0)}
        >
          <div>Custom Header</div>
          <div>Ribbon</div>
          <div className="grid grid-cols-[1fr_4fr_1fr] gap-2">
            <div>Left Sidebar</div>
            <div className="grid grid-rows-[1fr_4fr] gap-2">
              <div>Formula Bar</div>
              <div>Canvas Content</div>
            </div>
            <div>Right Sidebar</div>
          </div>
          <div>Footer</div>
        </div>

        <div
          className={clsx(`
            absolute inset-0 size-full rounded-md border p-2 shadow transition-all duration-500
            [&_div]:border [&_div]:p-2
          `, {
            'z-1 bg-white [&_div]:transition-all [&_div]:hover:border-blue-500': activeIndex === 1,
            'translate-x-4 -translate-y-4 cursor-pointer bg-neutral-100': activeIndex !== 1,
          })}
          onClick={() => setActiveIndex(1)}
        >
          <div className="h-full">
            Global Zone
          </div>
        </div>
      </div>
    </div>
  )
}
