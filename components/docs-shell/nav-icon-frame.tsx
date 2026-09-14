import type { ReactNode } from 'react'

export function NavIconFrame({ icon }: { icon: ReactNode }) {
  return (
    <span className="bg-background text-muted-foreground inline-flex size-6 min-w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border *:flex! *:size-3.5! *:min-w-3.5! *:items-center! *:justify-center! *:border-0! *:bg-transparent! *:p-0! *:leading-none! *:shadow-none! has-[[data-icon-variant=pro]]:border-0! has-[[data-icon-variant=pro]]:p-0! has-[[data-icon-variant=pro]]:text-white! [&_svg]:size-3.5! [&>[data-icon-variant=pro]]:size-full! [&>[data-icon-variant=pro]]:min-w-6! [&>[data-icon-variant=pro]]:rounded-md! [&>[data-icon-variant=pro]]:p-1!">
      {icon}
    </span>
  )
}
