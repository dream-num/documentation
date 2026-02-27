'use client'

import * as icons from '@univerjs/icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { ColorPickerPopover } from './color-picker'

interface IconItem {
  componentName: string
  kebabName: string
  component: any
}

function pascalToKebab(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function buildIconGroups() {
  const groups: Record<'single' | 'double' | 'multi', IconItem[]> = {
    single: [],
    double: [],
    multi: [],
  }

  for (const [componentName, component] of Object.entries(icons)) {
    const kebabName = pascalToKebab(componentName)
    const item = { componentName, kebabName, component }

    if (componentName.endsWith('DoubleIcon')) {
      groups.double.push(item)
    } else if (componentName.endsWith('MultiIcon')) {
      groups.multi.push(item)
    } else {
      groups.single.push(item)
    }
  }

  for (const group of Object.values(groups)) {
    group.sort((a, b) => a.componentName.localeCompare(b.componentName))
  }

  return groups
}

const iconGroups = buildIconGroups()

export function IconsGallery() {
  const [fontSize, setFontSize] = useState(22)
  const [color, setColor] = useState('#1b1c1e')
  const [colorChannel1, setColorChannel1] = useState('#2563eb')
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme === 'dark') {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setColor('#e4e4e7')
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setColorChannel1('#3b82f6')
    } else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setColor('#1b1c1e')
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setColorChannel1('#2563eb')
    }
  }, [resolvedTheme])

  return (
    // eslint-disable-next-line better-tailwindcss/no-unknown-classes
    <div className="not-prose space-y-6">
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div
          className={`
            flex flex-col gap-3
            md:flex-row md:items-center
          `}
        >
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <span className="text-xs text-muted-foreground">color</span>
            <ColorPickerPopover value={color} onValueChange={setColor} />
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <span className="text-xs text-muted-foreground">colorChannel1</span>
            <ColorPickerPopover
              value={colorChannel1}
              onValueChange={setColorChannel1}
            />
          </div>
          <div
            className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground"
          >
            <span>size</span>
            <Slider
              className="w-28"
              value={[fontSize]}
              min={12}
              max={40}
              step={1}
              onValueChange={value => setFontSize(value[0] ?? 22)}
            />
            <span>
              {fontSize}
              px
            </span>
          </div>
        </div>
      </section>

      {(Object.entries(iconGroups) as Array<[keyof typeof iconGroups, IconItem[]]>).map(([groupName, groupItems]) => (
        <section key={groupName} className="space-y-3">
          <h2 className="text-xl font-semibold capitalize">
            {groupName}
            {' '}
            (
            {groupItems.length}
            )
          </h2>

          <ul
            className={`
              grid grid-cols-2 gap-3
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            `}
          >
            {groupItems.map((item) => {
              const Icon = item.component

              return (
                <li
                  key={item.componentName}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex h-10 items-center justify-center">
                    <Icon
                      style={{
                        color,
                        fontSize: `${fontSize}px`,
                      }}
                      extend={{ colorChannel1 }}
                    />
                  </div>
                  <p className="mt-2 truncate text-center text-xs font-medium">
                    {item.componentName}
                  </p>
                  <p className="mt-1 truncate text-center text-[11px] text-muted-foreground">
                    {item.kebabName}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
