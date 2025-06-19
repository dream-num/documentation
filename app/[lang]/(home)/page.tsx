import { BookTextIcon, FerrisWheelIcon } from 'lucide-react'
import Link from 'next/link'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { customTranslations } from '@/lib/i18n'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: IProps) {
  const { lang } = await params

  return {
    title: 'Univer',
    description: customTranslations[lang]['home.description'],
  }
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      {/* Spotlight */}
      <div className="absolute h-full w-full" aria-label="Spotlight" aria-hidden="true">
        <div
          className={`
            absolute -top-1/2 -left-1/2 h-[880px] w-[1500px] rounded-full bg-[#7595FF] opacity-20 blur-[200px]
          `}
        />
        <div
          className={`
            absolute -top-1/2 -right-1/2 h-[950px] w-[1180px] rounded-full bg-[#F16CE4] opacity-10 blur-[140px]
          `}
        />
        <div
          className={`
            absolute top-1/2 left-1/2 h-[610px] w-[610px] -translate-y-1/2 rounded-full bg-[#A87DFF] opacity-10
            blur-[140px]
          `}
        />
      </div>

      {/* Hero */}
      <BlurFade duration={0.2}>
        <header className="relative px-4">
          <h1
            className={`
              mx-auto mb-4 max-w-3xl text-center text-3xl font-semibold
              md:text-4xl
              lg:text-6xl
            `}
          >
            {customTranslations[lang]['home.slogan']}
          </h1>

          <p
            className={`
              mx-auto mb-4 max-w-3xl text-center text-base text-neutral-600
              md:text-lg
              dark:text-neutral-300
            `}
          >
            {customTranslations[lang]['home.description']}
          </p>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href={`/${lang}/guides/sheets`}>
                <BookTextIcon />
                {customTranslations[lang]['documentation.title']}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/${lang}/showcase`}>
                <FerrisWheelIcon />
                {customTranslations[lang]['showcase.title']}
              </Link>
            </Button>
          </div>
        </header>
      </BlurFade>
    </div>
  )
}
