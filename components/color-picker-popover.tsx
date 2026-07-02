'use client'

import type { ColorLike } from 'color'
import Color from 'color'
import { useMemo, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker'

export function ColorPickerPopover({
  ariaLabel,
  value,
  onValueChange,
}: {
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
}) {
  const [color, setColor] = useState<ColorLike>(value)
  const [open, setOpen] = useState(false)

  const valueHex = useMemo(() => Color(value).hex(), [value])
  const draftHex = useMemo(() => Color(color).hex(), [color])
  const hexValue = open ? draftHex : valueHex

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setColor(valueHex)
      return
    }

    onValueChange(draftHex)
  }

  function handleChange(newColor: ColorLike) {
    setColor(Color(newColor).hex())
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          aria-label={ariaLabel}
          className="
            size-5 cursor-pointer rounded-md border-2 border-border/80 shadow-sm transition-all
            hover:scale-105 hover:border-foreground/30
          "
          style={{ backgroundColor: hexValue }}
          type="button"
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-78 max-w-[calc(100vw-1.5rem)] p-2.5"
        collisionPadding={12}
        side="bottom"
        sideOffset={8}
      >
        <ColorPicker className="w-full gap-2.5" defaultValue={hexValue} onChange={handleChange}>
          <ColorPickerSelection className="h-36 w-full" />
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat />
          </div>
        </ColorPicker>
      </PopoverContent>
    </Popover>
  )
}
