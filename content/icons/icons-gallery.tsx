'use client'

import type { ComponentType, CSSProperties } from 'react'
import * as icons from '@univerjs/icons'
import { CheckIcon, CopyIcon, SearchIcon, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ColorPickerPopover } from './color-picker'

interface IconItem {
  componentName: string
  kebabName: string
  component: ComponentType<{
    style?: CSSProperties
    extend?: { colorChannel1?: string }
  }>
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
    const item: IconItem = {
      componentName,
      kebabName,
      component: component as IconItem['component'],
    }

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

const PRESET_SIZES = [16, 20, 24, 32]

export function IconsGallery() {
  const { resolvedTheme } = useTheme()
  const [fontSize, setFontSize] = useState(22)
  const [search, setSearch] = useState('')
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const defaultColor = useMemo(
    () => (resolvedTheme === 'dark' ? '#e4e4e7' : '#1b1c1e'),
    [resolvedTheme],
  )
  const defaultColorChannel1 = useMemo(
    () => (resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'),
    [resolvedTheme],
  )

  const [customColor, setCustomColor] = useState<string | null>(null)
  const [customColorChannel1, setCustomColorChannel1] = useState<string | null>(null)

  const color = customColor ?? defaultColor
  const colorChannel1 = customColorChannel1 ?? defaultColorChannel1

  const iconGroups = useMemo(() => buildIconGroups(), [])

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return iconGroups

    const result: typeof iconGroups = { single: [], double: [], multi: [] }
    for (const [groupName, groupItems] of Object.entries(iconGroups) as Array<[keyof typeof iconGroups, IconItem[]]>) {
      result[groupName] = groupItems.filter(
        item =>
          item.componentName.toLowerCase().includes(term)
          || item.kebabName.toLowerCase().includes(term),
      )
    }
    return result
  }, [iconGroups, search])

  function handleCopy(text: string, componentName: string) {
    navigator.clipboard.writeText(text)
    setCopiedName(componentName)
    window.setTimeout(() => setCopiedName(null), 1500)
  }

  const totalCount = useMemo(
    () => Object.values(filteredGroups).reduce((sum, g) => sum + g.length, 0),
    [filteredGroups],
  )

  return (
    <div className="not-prose">
      {/* Toolbar */}
      <div
        className="
          flex flex-col gap-4 border-b pb-6
          md:flex-row md:items-end md:justify-between
        "
      >
        <div className="relative max-w-md flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search by name..."
            className="
              h-10 rounded-lg border-border/60 bg-transparent px-9 text-sm shadow-none transition-colors
              focus-visible:border-foreground/30 focus-visible:ring-0
            "
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="
                absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/60 transition-colors
                hover:bg-muted hover:text-foreground
              "
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">Color</span>
            <ColorPickerPopover value={color} onValueChange={setCustomColor} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">Channel</span>
            <ColorPickerPopover value={colorChannel1} onValueChange={setCustomColorChannel1} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">Size</span>
            <div className="flex items-center gap-1.5">
              {PRESET_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`
                    h-7 rounded-md px-2 text-xs font-medium transition-all
                    ${
                fontSize === size
                  ? 'bg-foreground text-background shadow-sm'
                  : `
                    bg-muted text-muted-foreground
                    hover:bg-muted/80 hover:text-foreground
                  `
                }
                  `}
                >
                  {size}
                </button>
              ))}
              <div className="mx-1 h-4 w-px bg-border" />
              <Slider
                className="w-20"
                value={[fontSize]}
                min={12}
                max={40}
                step={1}
                onValueChange={value => setFontSize(value[0] ?? 22)}
              />
              <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
                {fontSize}
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results summary */}
      {search && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground tabular-nums">{totalCount}</span>
          <span>results for</span>
          <span className="font-medium text-foreground">
            "
            {search}
            "
          </span>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
            <SearchIcon className="size-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No icons found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* Icon groups */}
      <div className="mt-8 space-y-10">
        {(Object.entries(filteredGroups) as Array<[keyof typeof filteredGroups, IconItem[]]>).map(
          ([groupName, groupItems]) =>
            groupItems.length === 0
              ? null
              : (
                  <section key={groupName}>
                    <div className="mb-5 flex items-baseline gap-3">
                      <h2 className="text-sm font-semibold tracking-widest text-foreground/80 uppercase">
                        {groupName}
                      </h2>
                      <span
                        className="
                          rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums
                        "
                      >
                        {groupItems.length}
                      </span>
                    </div>

                    <ul
                      className="
                        grid grid-cols-2 gap-1
                        sm:grid-cols-4
                        md:grid-cols-5
                        lg:grid-cols-6
                        xl:grid-cols-7
                      "
                    >
                      {groupItems.map((item) => {
                        const Icon = item.component
                        const isCopied = copiedName === item.componentName
                        const importStatement = `import { ${item.componentName} } from '@univerjs/icons'`

                        return (
                          <li
                            key={item.componentName}
                            className="
                              group relative rounded-xl p-3 transition-colors
                              hover:bg-muted/60
                            "
                          >
                            <button
                              type="button"
                              className="
                                absolute top-1.5 right-1.5 z-10 flex size-6 cursor-pointer items-center justify-center
                                rounded-md opacity-0 transition-all
                                group-hover:opacity-100
                                hover:bg-background
                              "
                              onClick={() => handleCopy(importStatement, item.componentName)}
                              title="Copy import"
                            >
                              {isCopied
                                ? (
                                    <CheckIcon
                                      className="
                                        size-3 text-emerald-600
                                        dark:text-emerald-400
                                      "
                                    />
                                  )
                                : (
                                    <CopyIcon className="size-3 text-muted-foreground/70" />
                                  )}
                            </button>

                            <div
                              className="
                                flex h-14 items-center justify-center transition-transform duration-200
                                group-hover:scale-110
                              "
                            >
                              <Icon
                                style={{
                                  color,
                                  fontSize: `${fontSize}px`,
                                }}
                                extend={groupName !== 'single' ? { colorChannel1 } : undefined}
                              />
                            </div>

                            <div className="mt-2 space-y-0.5 px-0.5">
                              <p className="truncate text-center text-[11px] font-medium text-foreground/90">
                                {item.componentName}
                              </p>
                              <p className="truncate text-center text-[10px] text-muted-foreground/60">
                                {item.kebabName}
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ),
        )}
      </div>
    </div>
  )
}
