'use client'

import type { AnchorHTMLAttributes } from 'react'
import { StarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getRepoStarsAndForks } from '@/lib/github'

export default function Stars({
  repo,
  owner,
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  owner: string
  repo: string
}) {
  const [stars, setStars] = useState(0)

  useEffect(() => {
    getRepoStarsAndForks(owner, repo)
      .then((repository) => {
        setStars(humanizeNumber(repository.stars))
      })
      .catch(() => undefined)
  }, [owner, repo])

  return (
    <p className="flex items-center gap-1 text-xs">
      <StarIcon className="size-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
      {stars > 0 && <span className="text-muted-foreground">{stars}K</span>}
    </p>
  )
}

/**
 * Converts a number to a human-readable string with K suffix for thousands
 * @example 1500 -> "1.5", 1000000 -> "1000000"
 */
function humanizeNumber(num: number): number {
  if (num < 100000) {
    // For numbers between 1,000 and 99,999, show with one decimal (e.g., 1.5K)
    const value = (num / 1000).toFixed(1)
    // Remove trailing .0 if present
    const formattedValue = value.endsWith('.0') ? value.slice(0, -2) : value

    return +formattedValue
  }

  if (num < 1000000) {
    // For numbers between 10,000 and 999,999, show as whole K (e.g., 10K, 999K)
    return Math.floor(num / 1000)
  }

  // For 1,000,000 and above, just return the number
  return num
}
