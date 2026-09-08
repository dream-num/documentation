import process from 'node:process'
import { permanentRedirect } from 'next/navigation'

import { localizePath } from '@/lib/i18n'

interface IProps {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: IProps) {
  const { lang } = await params
  const path = localizePath('/guides/sheets', lang)

  if (process.env.GITHUB_PAGES === 'true') {
    const destination = `${process.env.NEXT_PUBLIC_BASE_PATH ?? '/documentation/v0.25'}${path}/`
    return (
      <>
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <a href={destination}>Univer v0.25.x</a>
      </>
    )
  }

  permanentRedirect(path)
}
