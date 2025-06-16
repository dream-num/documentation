import { customTranslations } from '@/lib/i18n'
import IconBlock from './icon-block'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Univer Icons',
  description: 'An icon library for Univer',
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  return (
    <main
      className={`
        container
        max-sm:px-0
        md:py-12
      `}
    >
      <header
        className={`
          mb-4 bg-neutral-50 p-6
          dark:bg-neutral-900
        `}
      >
        <h1 className="mb-2 text-3xl font-semibold">
          {customTranslations[lang]['icons.title']}
        </h1>
        <p
          className={`
            text-neutral-700
            dark:text-neutral-300
          `}
        >
          {customTranslations[lang]['icons.slogan']}
        </p>
      </header>

      <IconBlock />
    </main>
  )
}
