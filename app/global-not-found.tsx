import Link from 'next/link'
import './global.css'

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <main className="text-center">
          <h1 className="mb-2 text-3xl font-bold">Page Not Found</h1>
          <p className="mb-6 text-muted-foreground">The page you are looking for does not exist.</p>
          <Link href="/" className="underline underline-offset-4">
            Go Home
          </Link>
        </main>
      </body>
    </html>
  )
}
