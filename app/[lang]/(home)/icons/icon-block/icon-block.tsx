'use client'

import * as icons from '@univerjs/icons'
import * as manifest from '@univerjs/icons/esm/manifest'
import { type ComponentType, useMemo, useState } from 'react'
import { Tooltip } from '@/components/tooltip'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function IconBlock() {
  const [fontSize, setFontSize] = useState(24)
  const [color, _setColor] = useState('#737373')
  const [colorChannel1, _setColorChannel1] = useState('#2563eb')

  const group = Object.keys(manifest).filter(key => key.startsWith('v4')).map((key) => {
    return {
      name: key.replace('v4', '').replace('Manifest', ''),
      icons: manifest[key as keyof typeof manifest],
    }
  })

  const [activeGroupName, setActiveGroupName] = useState(group[0].name)
  const activeGroup = useMemo(() => {
    return group.find(item => item.name === activeGroupName) ?? group[0]
  }, [activeGroupName, group])

  function getIcon(icon: string) {
    const IconComponent = icons[icon as keyof typeof icons] as ComponentType<any>

    if (IconComponent) {
      return <IconComponent style={{ color, fontSize: `${fontSize}px` }} extend={{ colorChannel1 }} />
    }
    return null
  }

  return (
    <section className="px-4">
      <div className="mb-4 flex justify-between">
        <div className="flex">
          <Tabs defaultValue={group[0].name}>
            <TabsList>
              {group.map(item => (
                <div key={item.name}>
                  <TabsTrigger value={item.name} onClick={() => setActiveGroupName(item.name)}>{item.name}</TabsTrigger>
                </div>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2">
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
        {activeGroup.icons.map(icon => (
          <li key={icon.stem} className="text-center">
            <Tooltip content={icon.icon}>
              <div
                className={`
                  flex aspect-square size-16 flex-col items-center justify-center rounded-md bg-neutral-50 p-2
                  dark:bg-neutral-800
                `}
              >
                <div>{getIcon(icon.icon)}</div>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    </section>
  )
}
