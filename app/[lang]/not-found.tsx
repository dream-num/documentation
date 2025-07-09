import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="bg-muted flex h-screen w-full flex-col items-center justify-center px-4">
      <div>
        <h1 className="mb-2 text-center text-3xl font-bold">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6 text-center text-lg">
          The page you are looking for does not exist.
        </p>

        <div className="text-center">
          <Button asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
