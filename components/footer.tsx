export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`
        mt-auto w-full border-t border-neutral-100 bg-white/5 p-4 text-center backdrop-blur-xs
        dark:border-neutral-800
      `}
    >
      <p
        className={`
          text-sm text-neutral-600
          dark:text-neutral-300
        `}
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
