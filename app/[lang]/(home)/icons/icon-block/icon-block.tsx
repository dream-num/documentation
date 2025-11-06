'use client'

import * as icons from '@univerjs/icons'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import { Tooltip } from '@/components/tooltip'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPickerPopover } from './color-picker'

function pascalCaseKebabCase(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

export default function IconBlock() {
  const [fontSize, setFontSize] = useState(24)
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

  const manifest = Object.keys(icons).reduce((acc, key) => {
    let type = 'single'
    if (key.endsWith('DoubleIcon')) {
      type = 'double'
    } else if (key.endsWith('MultiIcon')) {
      type = 'multi'
    }

    const meta = {
      name: pascalCaseKebabCase(key),
      componentName: key,
      icon: (icons as any)[key],
    }

    if (!acc[type]) {
      acc[type] = []
    }

    acc[type].push(meta)

    return acc
  }, {} as Record<string, any>)

  const [activeGroupName, setActiveGroupName] = useState('single')
  const activeGroup = useMemo(() => {
    return manifest[activeGroupName] ?? manifest.single
  }, [activeGroupName, manifest])

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="px-4">
      <div className="mb-4 flex justify-between">
        <div className="flex">
          <Tabs value={activeGroupName}>
            <TabsList>
              {Object.keys(manifest).map(key => (
                <div key={key}>
                  <TabsTrigger value={key} onClick={() => setActiveGroupName(key)}>{key}</TabsTrigger>
                </div>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <ColorPickerPopover value={color} onValueChange={setColor} />
          <ColorPickerPopover value={colorChannel1} onValueChange={setColorChannel1} />
          <Slider
            className="w-32"
            value={[fontSize]}
            max={48}
            min={12}
            step={1}
            onValueChange={value => setFontSize(value[0])}
          />
        </div>
      </div>

      <ul className="flex flex-wrap gap-4">
        {activeGroup.map((icon: any) => (
          <li key={icon.name} className="text-center">
            <Tooltip content={icon.name}>
              <button
                className={`
                  flex aspect-square size-16 cursor-pointer flex-col items-center justify-center rounded-md
                  bg-neutral-50 p-2 transition-transform
                  hover:scale-105
                  active:scale-95
                  dark:bg-neutral-800
                `}
                type="button"
                onClick={() => handleCopy(icon.name)}
              >
                <icon.icon
                  style={{ color, fontSize: `${fontSize}px` }}
                  extend={{ colorChannel1 }}
                />
              </button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </section>
  )
}
