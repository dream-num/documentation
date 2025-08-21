import type { AnchorHTMLAttributes } from 'react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { clsx } from '@/lib/clsx'
import { DynamicStars } from './dynamic-stars'

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

      <DynamicStars
        repo={repo}
        owner={owner}
        token={token}
      />
    </a>
  )
}
