import { Header } from '@/components/header'
import { customTranslations } from '@/lib/i18n'
import pkg from '@/package.json'

import IconBlock from './icon-block'

const iconVersion = pkg.dependencies['@univerjs/icons'].replace('^', '')

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
    <div
      className={`
        container
        max-sm:px-0
        md:py-12
      `}
    >
      <Header
        title={(
          <>
            {customTranslations[lang]['icons.title']}
            <sup className="-top-4 ml-1 text-sm">
              v
              {iconVersion}
            </sup>
          </>
        )}
        slogan={customTranslations[lang]['icons.slogan']}
      />

      <section className="mt-4">
        <IconBlock />
      </section>
    </div>
  )
}
