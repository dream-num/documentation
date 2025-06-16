export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`
        mt-auto border-t border-neutral-100 p-4 text-center
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
