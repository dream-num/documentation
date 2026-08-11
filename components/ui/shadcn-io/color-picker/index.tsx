'use client'

import type { ComponentProps, HTMLAttributes } from 'react'
import * as BaseSlider from '@base-ui/react/slider'
import Color from 'color'
import { PipetteIcon } from 'lucide-react'
import { createContext, memo, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clsx } from '@/lib/clsx'

interface IColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
}

const ColorPickerContext = createContext<IColorPickerContextValue | undefined>(undefined)

export function useColorPicker() {
  const context = use(ColorPickerContext)

  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider')
  }

  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0]
  defaultValue?: Parameters<typeof Color>[0]
  onChange?: (value: Parameters<typeof Color.rgb>[0]) => void
}

export function ColorPicker({ value, defaultValue = '#000000', onChange, className, ...props }: ColorPickerProps) {
  const selectedColor = Color(value)
  const defaultColor = Color(defaultValue)

  const [hue, setHue] = useState(selectedColor.hue() || defaultColor.hue() || 0)
  const [saturation, setSaturation] = useState(selectedColor.saturationl() || defaultColor.saturationl() || 100)
  const [lightness, setLightness] = useState(selectedColor.lightness() || defaultColor.lightness() || 50)
  const [alpha, setAlpha] = useState(selectedColor.alpha() * 100 || defaultColor.alpha() * 100)
  const [mode, setMode] = useState('hex')

  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color.rgb(value).rgb().object()

      setHue(color.r)
      setSaturation(color.g)
      setLightness(color.b)
      setAlpha(color.a)
    }
  }, [value])

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
      const rgba = color.rgb().array()

      onChange([rgba[0], rgba[1], rgba[2], alpha / 100])
    }
  }, [hue, saturation, lightness, alpha, onChange])

  return (
    <ColorPickerContext
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div className={clsx('flex size-full flex-col gap-4', className)} {...props} />
    </ColorPickerContext>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const { hue, setSaturation, setLightness } = useColorPicker()

  const backgroundGradient = useMemo(() => {
    return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`
  }, [hue])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!(isDragging && containerRef.current)) {
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setPositionX(x)
      setPositionY(y)
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      const lightness = topLightness * (1 - y)

      setLightness(lightness)
    },
    [isDragging, setSaturation, setLightness],
  )

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  return (
    <div
      className={clsx('relative size-full cursor-crosshair rounded-sm', className)}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
      ref={containerRef}
      style={{
        background: backgroundGradient,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute size-4 -translate-1/2 rounded-full border-2 border-white"
        style={{
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  )
})

ColorPickerSelection.displayName = 'ColorPickerSelection'

export type ColorPickerHueProps = BaseSlider.Slider.Root.Props<readonly number[]>

export function ColorPickerHue({ className, ...props }: ColorPickerHueProps) {
  const { hue, setHue } = useColorPicker()

  return (
    <BaseSlider.Slider.Root
      className={clsx('relative flex h-4 w-full touch-none', className)}
      max={360}
      onValueChange={([nextHue]) => {
        if (nextHue !== undefined) {
          setHue(nextHue)
        }
      }}
      step={1}
      value={[hue]}
      {...props}
    >
      <BaseSlider.Slider.Control className="relative flex w-full touch-none items-center">
        <BaseSlider.Slider.Track
          className={`relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]`}
        >
          <BaseSlider.Slider.Indicator className="absolute h-full" />
        </BaseSlider.Slider.Track>
        <BaseSlider.Slider.Thumb
          className={`border-primary/50 bg-background focus-visible:ring-ring block size-4 rounded-full border shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50`}
        />
      </BaseSlider.Slider.Control>
    </BaseSlider.Slider.Root>
  )
}

export type ColorPickerAlphaProps = BaseSlider.Slider.Root.Props<readonly number[]>

export function ColorPickerAlpha({ className, ...props }: ColorPickerAlphaProps) {
  const { alpha, setAlpha } = useColorPicker()

  return (
    <BaseSlider.Slider.Root
      className={clsx('relative flex h-4 w-full touch-none', className)}
      max={100}
      onValueChange={([nextAlpha]) => {
        if (nextAlpha !== undefined) {
          setAlpha(nextAlpha)
        }
      }}
      step={1}
      value={[alpha]}
      {...props}
    >
      <BaseSlider.Slider.Control className="relative flex w-full touch-none items-center">
        <BaseSlider.Slider.Track
          className="relative my-0.5 h-3 w-full grow rounded-full"
          style={{
            background:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent to-black/50" />
          <BaseSlider.Slider.Indicator className="absolute h-full rounded-full bg-transparent" />
        </BaseSlider.Slider.Track>
        <BaseSlider.Slider.Thumb
          className={`border-primary/50 bg-background focus-visible:ring-ring block size-4 rounded-full border shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50`}
        />
      </BaseSlider.Slider.Control>
    </BaseSlider.Slider.Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export function ColorPickerEyeDropper({ className, ...props }: ColorPickerEyeDropperProps) {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      const color = Color(result.sRGBHex)
      const [h, s, l] = color.hsl().array()

      setHue(h)
      setSaturation(s)
      setLightness(l)
      setAlpha(100)
    } catch (error) {
      console.error('EyeDropper failed:', error)
    }
  }

  return (
    <Button
      className={clsx('text-muted-foreground shrink-0', className)}
      onClick={handleEyeDropper}
      size="icon"
      variant="outline"
      type="button"
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ['hex', 'rgb', 'css', 'hsl']

export function ColorPickerOutput({ className, ...props }: ColorPickerOutputProps) {
  const { mode, setMode } = useColorPicker()

  return (
    <Select
      onValueChange={(nextMode) => {
        if (nextMode !== null) {
          setMode(nextMode)
        }
      }}
      value={mode}
    >
      <SelectTrigger className={clsx('h-8 w-20 shrink-0 text-xs', className)} {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type PercentageInputProps = ComponentProps<typeof Input>

function PercentageInput({ className, ...props }: PercentageInputProps) {
  return (
    <div className="relative">
      <Input
        readOnly
        type="text"
        {...props}
        className={clsx('bg-secondary h-8 w-13 rounded-l-none px-2 text-xs shadow-none', className)}
      />
      <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs">%</span>
    </div>
  )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export function ColorPickerFormat({ className, ...props }: ColorPickerFormatProps) {
  const { hue, saturation, lightness, alpha, mode } = useColorPicker()
  const color = Color.hsl(hue, saturation, lightness, alpha / 100)

  if (mode === 'hex') {
    const hex = color.hex()

    return (
      <div className={clsx('relative flex w-full items-center -space-x-px rounded-md shadow-sm', className)} {...props}>
        <Input className="bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none" readOnly type="text" value={hex} />
        <PercentageInput value={alpha} />
      </div>
    )
  }

  if (mode === 'rgb') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value))

    return (
      <div className={clsx('flex items-center -space-x-px rounded-md shadow-sm', className)} {...props}>
        {rgb.map((value, index) => (
          <Input
            className={clsx(
              'bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className,
            )}
            key={index}
            readOnly
            type="text"
            value={value}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    )
  }

  if (mode === 'css') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value))

    return (
      <div className={clsx('w-full rounded-md shadow-sm', className)} {...props}>
        <Input
          className="bg-secondary h-8 w-full px-2 text-xs shadow-none"
          readOnly
          type="text"
          value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'hsl') {
    const hsl = color
      .hsl()
      .array()
      .map((value) => Math.round(value))

    return (
      <div className={clsx('flex items-center -space-x-px rounded-md shadow-sm', className)} {...props}>
        {hsl.map((value, index) => (
          <Input
            className={clsx(
              'bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className,
            )}
            key={index}
            readOnly
            type="text"
            value={value}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    )
  }

  return null
}
