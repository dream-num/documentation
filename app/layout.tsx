import type { ReactNode } from 'react'
import NextTopLoader from 'nextjs-toploader'

import './global.css'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <NextTopLoader
          color="#171717"
          showSpinner={false}
          crawlSpeed={180}
          easing="ease-in-out"
          speed={350}
          shadow="0 0 10px #171717,0 0 5px #171717"
          zIndex={99999}
        />
        {children}
      </body>
    </html>
  )
}
