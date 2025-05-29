import type { ClassValue } from 'clsx'
import _clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export default function clsx(...inputs: ClassValue[]) {
  return twMerge(_clsx(inputs))
}
