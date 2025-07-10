export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full bg-white/5 p-4 text-center backdrop-blur-xs">
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
