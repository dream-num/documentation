import type { ColorLike } from 'color'
import Color from 'color'
import { useEffect, useMemo, useState } from 'react'
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
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const [color, setColor] = useState<ColorLike>(value)
  const [open, setOpen] = useState(false)

  const hexValue = useMemo(() => Color(color).hex(), [color])

  useEffect(() => {
    setColor(value)
  }, [value])

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      onValueChange(hexValue)
    }
  }

  function handleChange(newColor: ColorLike) {
    setColor(Color(newColor).hex())
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="
            size-5 cursor-pointer rounded-md border-2 border-border/80 shadow-sm transition-all
            hover:scale-105 hover:border-foreground/30
          "
          style={{ backgroundColor: hexValue }}
          type="button"
          aria-label="Pick color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="end">
        <ColorPicker defaultValue={hexValue} onChange={handleChange}>
          <ColorPickerSelection className="h-48 w-full" />
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
