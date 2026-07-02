import { clsx } from '@/lib/clsx'

const currentYear = new Date().getFullYear()

export function Footer({
  className,
  variant = 'site',
}: {
  className?: string
  variant?: 'site' | 'content'
}) {
  const isContent = variant === 'content'

  return (
    <footer
      className={clsx(
        'w-full text-sm text-muted-foreground',
        isContent
          ? 'mt-14 border-t pt-6 pb-1'
          : 'border-t bg-background px-4 py-6',
        className,
      )}
      data-site-footer
    >
      <p
        className={clsx(
          isContent
            ? 'mx-0 max-w-none'
            : 'mx-auto flex max-w-384 items-center justify-center',
        )}
      >
        &copy;
        {' '}
        {currentYear}
        {' '}
        DreamNum Co., Ltd.
      </p>
    </footer>
  )
}
