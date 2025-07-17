'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function RibbonStyle() {
  const [ribbonType, setRibbonType] = useState<string>('default')

  return (
    <div>
      <Tabs className="mb-2" defaultValue="default" onValueChange={setRibbonType}>
        <TabsList>
          <TabsTrigger value="default">default</TabsTrigger>
          <TabsTrigger value="simple">simple</TabsTrigger>
        </TabsList>
      </Tabs>

      <header className="flex h-8 items-center gap-2 rounded-md bg-neutral-100 px-2">
        {ribbonType === 'default' && <div className="h-6 w-14 rounded-md bg-neutral-800" />}

        <ul
          className={`
            m-0 flex list-none gap-2 overflow-hidden p-0!
            [&>li]:h-6 [&>li]:w-6 [&>li]:shrink-0 [&>li]:rounded-md [&>li]:bg-neutral-300
          `}
        >
          {Array.from({ length: 12 + (ribbonType === 'simple' ? 8 : 0) }).map((_, index) => (
            <li
              key={index}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            />
          ))}
        </ul>
      </header>
    </div>
  )
}
