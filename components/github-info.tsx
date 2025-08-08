'use client'

import type { AnchorHTMLAttributes } from 'react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { StarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SlidingNumber } from '@/components/animate-ui/text/sliding-number'
import { clsx } from '@/lib/clsx'

async function getRepoStarsAndForks(
  owner: string,
  repo: string,
  token?: string,
): Promise<{
  stars: number
  forks: number
}> {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}`
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(endpoint, {
    headers,
    next: {
      revalidate: 60,
    },
  })

  if (!response.ok) {
    const message = await response.text()

    throw new Error(`Failed to fetch repository data: ${message}`)
  }

  const data = await response.json()
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
  }
}

export function GithubInfo({
  repo,
  owner,
  token,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  owner: string
  repo: string
  token?: string
}) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentStars, setCurrentStars] = useState(0)
  const [stars, setStars] = useState(0)
  const [fillPercentage, setFillPercentage] = useState(0)

  useEffect(() => {
    getRepoStarsAndForks(owner, repo, token)
      .then(({ stars }) => {
        setStars(humanizeNumber(stars))
      })
  }, [owner, repo, token])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStars((prev) => {
        if (prev < stars) {
          if (prev + 1 >= stars) {
            setIsCompleted(true)
            return stars
          }
          setFillPercentage(((prev + 1) / stars) * 100)

          return prev + 0.8
        }
        clearInterval(interval)
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [stars])

  return (
    <a
      href={`https://github.com/${owner}/${repo}`}
      rel="noreferrer noopener"
      target="_blank"
      {...props}
      className={clsx(
        `
          flex gap-1.5 rounded-lg px-3 text-sm text-fd-foreground/80 transition-colors
          hover:text-fd-accent-foreground
          lg:flex-row lg:items-center
        `,
        props.className,
      )}
    >
      <p className="flex items-center gap-2 truncate">
        <SiGithub className="size-4" />
        {owner}
        /
        {repo}
      </p>
      <p className="flex items-center gap-1 text-xs text-fd-muted-foreground">
        <span className="relative">
          <StarIcon
            className="size-3 fill-neutral-300 text-neutral-300"
            aria-hidden="true"
          />
          <StarIcon
            className="absolute top-0 size-3 fill-yellow-500 text-yellow-500"
            aria-hidden="true"
            style={{
              clipPath: `inset(${100 - (isCompleted ? fillPercentage : fillPercentage - 10)}% 0 0 0)`,
            }}
          />
        </span>
        {stars > 0 && (
          <span className="inline-flex">
            <SlidingNumber
              number={currentStars}
              decimalPlaces={1}
            />
            K
          </span>
        )}
      </p>
    </a>
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
