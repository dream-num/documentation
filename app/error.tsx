'use client'

import { Button } from '@/components/ui/button'

interface IProps {
  reset: () => void
}

export default function Error(props: IProps) {
  const { reset } = props

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-muted px-4">
      <div>
        <h1 className="mb-2 text-center text-3xl font-bold">
          Something went wrong
        </h1>
        <p className="mb-6 text-center text-lg text-muted-foreground">
          An unexpected error has occurred. Please try again later.
        </p>

        <div className="text-center">
          <Button onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </main>
  )
}
