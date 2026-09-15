import { clsx } from '@/lib/clsx'

const currentYear = new Date().getFullYear()

export function Footer({ className, variant = 'site' }: { className?: string; variant?: 'site' | 'content' }) {
  const isContent = variant === 'content'

  return (
    <footer
      className={clsx(
        'text-muted-foreground w-full text-sm',
        isContent ? 'mt-14 border-t pt-6 pb-1' : 'bg-background border-t px-4 py-3',
        className,
      )}
      data-site-footer
    >
      <p className={clsx(isContent ? 'mx-0 max-w-none' : 'mx-auto flex max-w-384 items-center justify-center')}>
        &copy; {currentYear} DreamNum Co., Ltd.
      </p>
    </footer>
  )
}
