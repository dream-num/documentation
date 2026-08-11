import * as BaseSlider from '@base-ui/react/slider'
import { useMemo } from 'react'

import { clsx } from '@/lib/clsx'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: BaseSlider.Slider.Root.Props<readonly number[]>) {
  const _values = useMemo(() => value ?? defaultValue ?? [min, max], [value, defaultValue, min, max])

  return (
    <BaseSlider.Slider.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={clsx('data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full', className)}
      thumbAlignment="edge"
      {...props}
    >
      <BaseSlider.Slider.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <BaseSlider.Slider.Track
          data-slot="slider-track"
          className={clsx(
            `bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5`,
          )}
        >
          <BaseSlider.Slider.Indicator
            data-slot="slider-range"
            className={clsx(`bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full`)}
          />
        </BaseSlider.Slider.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <BaseSlider.Slider.Thumb
            data-slot="slider-thumb"
            index={index}
            key={index}
            className={`border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50`}
          />
        ))}
      </BaseSlider.Slider.Control>
    </BaseSlider.Slider.Root>
  )
}

export { Slider }
