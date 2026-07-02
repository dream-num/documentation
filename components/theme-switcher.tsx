'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher({
  label,
}: {
  label: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={() => setTheme(nextTheme)}
    >
      <SunIcon
        className="
          size-4
          dark:hidden
        "
      />
      <MoonIcon
        className="
          hidden size-4
          dark:block
        "
      />
    </Button>
  )
}
