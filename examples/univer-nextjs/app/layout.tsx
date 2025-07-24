import type { Metadata } from 'next'

import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Univer ❤️ Next.js',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
