import type { ColorLike } from 'color'
import Color from 'color'
import { useState } from 'react'
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

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      onValueChange(Color(color).hex())
    }
  }

  function handleChange(newColor: ColorLike) {
    setColor(Color(newColor).hex())
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="size-6 cursor-pointer rounded-md ring ring-accent-foreground/40 ring-offset-1"
          style={{ backgroundColor: Color(color).hex() }}
          type="button"
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="end">
        <ColorPicker defaultValue={Color(color).hex()} onChange={handleChange}>
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
