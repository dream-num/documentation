'use client'

import { useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Preset colors from Univer sheets/src/models/range-themes/build-in-theme.factory.ts.
const palettes = [
  [
    'blue',
    'rgb(164, 202, 254)',
    'rgb(225, 239, 254)',
    'rgb(63, 131, 248)',
    'rgb(195, 221, 253)',
    'rgb(30, 66, 159)',
    'rgb(195, 221, 253)',
    'rgb(118, 169, 250)',
  ],
  [
    'grey',
    'rgb(205, 208, 216)',
    'rgb(238, 239, 241)',
    'rgb(95, 101, 116)',
    'rgb(227, 229, 234)',
    'rgb(44, 48, 64)',
    'rgb(227, 229, 234)',
    'rgb(151, 157, 172)',
  ],
  [
    'red',
    'rgb(248, 180, 180)',
    'rgb(253, 232, 232)',
    'rgb(240, 82, 82)',
    'rgb(251, 213, 213)',
    'rgb(155, 28, 28)',
    'rgb(251, 213, 213)',
    'rgb(249, 128, 128)',
  ],
  [
    'orange',
    'rgb(253, 186, 140)',
    'rgb(254, 236, 220)',
    'rgb(255, 90, 31)',
    'rgb(252, 217, 189)',
    'rgb(180, 52, 3)',
    'rgb(252, 217, 189)',
    'rgb(255, 138, 76)',
  ],
  [
    'yellow',
    'rgb(250, 200, 21)',
    'rgb(255, 244, 185)',
    'rgb(212, 157, 15)',
    'rgb(252, 220, 106)',
    'rgb(154, 109, 21)',
    'rgb(252, 220, 106)',
    'rgb(212, 157, 15)',
  ],
  [
    'green',
    'rgb(132, 225, 188)',
    'rgb(222, 247, 236)',
    'rgb(13, 164, 113)',
    'rgb(188, 240, 218)',
    'rgb(4, 108, 78)',
    'rgb(188, 240, 218)',
    'rgb(49, 196, 141)',
  ],
  [
    'azure',
    'rgb(126, 220, 226)',
    'rgb(213, 245, 246)',
    'rgb(6, 148, 162)',
    'rgb(175, 236, 239)',
    'rgb(3, 102, 114)',
    'rgb(175, 236, 239)',
    'rgb(22, 189, 202)',
  ],
  [
    'indigo',
    'rgb(186, 198, 248)',
    'rgb(233, 237, 255)',
    'rgb(70, 106, 247)',
    'rgb(210, 218, 250)',
    'rgb(16, 51, 191)',
    'rgb(210, 218, 250)',
    'rgb(98, 128, 249)',
  ],
  [
    'purple',
    'rgb(202, 191, 253)',
    'rgb(237, 235, 254)',
    'rgb(144, 97, 249)',
    'rgb(220, 215, 254)',
    'rgb(74, 29, 150)',
    'rgb(220, 215, 254)',
    'rgb(172, 148, 250)',
  ],
  [
    'magenta',
    'rgb(248, 180, 217)',
    'rgb(252, 232, 243)',
    'rgb(231, 70, 148)',
    'rgb(250, 209, 232)',
    'rgb(153, 21, 75)',
    'rgb(250, 209, 232)',
    'rgb(241, 126, 184)',
  ],
] as const

export function RangeThemeDemo() {
  const [family, setFamily] = useState('light')
  const [color, setColor] = useState('blue')
  const palette = palettes.find(([name]) => name === color)!
  const [, lightHeader, lightColumn, middleHeader, middleBand, darkHeader, darkFirst, darkSecond] = palette
  const themeName = family === 'default' ? 'default' : `${family}-${color}`

  // Match RangeThemeStyle.getStyle: headers/last rows override column and row banding.
  const background = (row: number, column: number) => {
    if (family === 'default') return row === 0 ? 'rgb(68,114,196)' : row % 2 === 1 ? 'rgb(217,225,242)' : '#fff'
    if (row === 0 || row === 5)
      return family === 'light' ? lightHeader : family === 'middle' ? middleHeader : darkHeader
    if (family === 'light') return column % 2 === 0 ? lightColumn : '#fff'
    if (family === 'middle') return column === 0 || column === 4 || row % 2 === 0 ? middleBand : '#fff'
    return row % 2 === 1 ? darkFirst : darkSecond
  }

  return (
    <section aria-label="Range themes" className="not-prose my-4 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={family} onValueChange={setFamily}>
          <TabsList>
            {['default', 'light', 'middle', 'dark'].map((name) => (
              <TabsTrigger key={name} value={name}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {family !== 'default' && (
          <div role="group" aria-label="Theme color" className="flex flex-wrap gap-1">
            {palettes.map(([name, header]) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                title={`${family}-${name}`}
                aria-pressed={color === name}
                onClick={() => setColor(name)}
                className="flex size-7 items-center justify-center rounded-md border border-transparent focus-visible:outline-2 focus-visible:outline-blue-500 aria-pressed:border-blue-500"
              >
                <span aria-hidden="true" className="size-4 rounded-sm" style={{ backgroundColor: header }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        role="img"
        aria-label={themeName}
        className="grid grid-cols-5 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
      >
        {Array.from({ length: 30 }, (_, index) => {
          const row = Math.floor(index / 5)
          const column = index % 5
          return (
            <div
              key={index}
              className="flex h-6 items-center justify-center"
              style={{ backgroundColor: background(row, column) }}
            >
              {row === 0 && (
                <span
                  className="h-1 w-6 rounded-full"
                  style={{
                    backgroundColor: family === 'dark' || family === 'default' ? '#fff' : '#111827',
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
