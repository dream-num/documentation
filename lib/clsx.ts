import { type ClassValue, clsx as originalClsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function clsx(...inputs: ClassValue[]) {
  return twMerge(originalClsx(inputs))
}
