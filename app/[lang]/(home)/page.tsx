import { BookTextIcon, FerrisWheelIcon } from 'lucide-react'
import Link from 'next/link'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BlurFade } from '@/components/magicui/blur-fade'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import Univer from '@/components/univer'
import { customTranslations } from '@/lib/i18n'
import pkg from '@/package.json'

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
    <>
      {/* Spotlight */}
      <div className="fixed inset-0 z-1 size-full overflow-hidden">
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
      </div>

      <div
        className={`
          relative z-1 flex flex-col items-center py-8
          md:py-12
        `}
      >
        {/* Hero */}
        <BlurFade duration={0.2}>
          <header
            className={`
              relative px-4 pt-12 pb-24
              md:pt-36
            `}
          >
            <div className="mb-6 text-center">
              <Link
                className={`
                  mx-auto inline-block rounded-full border bg-neutral-50 py-1 text-sm font-semibold shadow
                  transition-colors
                  hover:bg-neutral-100
                  dark:bg-neutral-800 dark:hover:bg-neutral-900
                `}
                href={`https://github.com/dream-num/univer/releases/tag/v${pkg.version}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className={`
                    border-r border-neutral-300 py-1 pr-1.5 pl-3
                    dark:border-neutral-700
                  `}
                >
                  🎉
                </span>
                <AnimatedShinyText className="py-1 pr-3 pl-1.5">
                  Univer v
                  {pkg.version}
                  {' '}
                  {customTranslations[lang]['banner.release']}
                </AnimatedShinyText>
              </Link>
            </div>

            <h1
              className={`
                mx-auto mb-6 max-w-3xl bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text text-center
                text-3xl font-semibold text-transparent
                md:text-4xl
                lg:text-6xl
                dark:from-white dark:to-white/40
              `}
            >
              {customTranslations[lang]['home.slogan']}
            </h1>

            <p
              className={`
                mx-auto mb-6 max-w-3xl text-center text-base text-neutral-600
                md:text-lg
                dark:text-neutral-300
              `}
            >
              {customTranslations[lang]['home.description']}
            </p>

            <div className="flex justify-center gap-4">
              <RainbowButton asChild>
                <Link href={`/${lang}/guides/sheets`}>
                  <BookTextIcon />
                  {customTranslations[lang]['documentation.title']}
                </Link>
              </RainbowButton>
              <RainbowButton variant="outline" asChild>
                <Link href={`/${lang}/showcase`}>
                  <FerrisWheelIcon />
                  {customTranslations[lang]['showcase.title']}
                </Link>
              </RainbowButton>
            </div>
          </header>
        </BlurFade>

        <div className="relative w-full px-12">
          <Univer />
        </div>
      </div>
    </>
  )
}
