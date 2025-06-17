import { Header } from '@/components/header'
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
      <Header
        title={customTranslations[lang]['icons.title']}
        slogan={customTranslations[lang]['icons.slogan']}
      />

      <section className="mt-4">
        <IconBlock />
      </section>
    </main>
  )
}
