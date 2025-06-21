import type { ClassValue } from 'clsx'
import { clsx as originalClsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function clsx(...inputs: ClassValue[]) {
  return twMerge(originalClsx(inputs))
}
