import { BookTextIcon, FerrisWheelIcon } from 'lucide-react'
import Link from 'next/link'
import BlurryBlob from '@/components/animata/blurry-blob'
import { Customer } from '@/components/customer'
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
        <div className="relative container size-full">
          <div className="absolute top-1/3 left-1/6">
            <BlurryBlob
              className={`
                rounded-xl opacity-50
                dark:opacity-35
              `}
              firstBlobColor="bg-red-200 dark:bg-red-800"
              secondBlobColor="bg-purple-200 dark:bg-blue-800"
            />
          </div>
          <div className="absolute right-1/7 bottom-0 rotate-90">
            <BlurryBlob
              className="rounded-xl opacity-45"
              firstBlobColor="bg-green-300 dark:bg-rose-800"
              secondBlobColor="bg-blue-200 dark:bg-teal-800"
            />
          </div>
          <div className="absolute -bottom-1/6 left-0">
            <BlurryBlob
              className="rounded-xl opacity-25"
              firstBlobColor="bg-yellow-300 dark:bg-orange-800"
              secondBlobColor="bg-indigo-800 dark:bg-pink-900"
            />
          </div>
        </div>
      </div>

      <div
        className={`
          relative z-1 flex flex-col items-center gap-8 py-8
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
                  mx-auto inline-block rounded-full bg-neutral-50 py-1 text-sm font-semibold shadow-sm transition-colors
                  hover:bg-neutral-100
                  dark:bg-neutral-800 dark:hover:bg-neutral-900
                `}
                href="/blog/weekly-4"
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
                mx-auto mb-10 max-w-3xl text-center text-base text-neutral-600
                md:text-lg
                dark:text-neutral-300
              `}
            >
              {customTranslations[lang]['home.description']}
              <span
                className="font-medium text-green-600 underline decoration-current decoration-wavy underline-offset-4"
              >
                {customTranslations[lang]['home.description.sheets']}
              </span>
              {customTranslations[lang]['home.description.split']}
              <span
                className="font-medium text-blue-600 underline decoration-current decoration-wavy underline-offset-4"
              >
                {customTranslations[lang]['home.description.docs']}
              </span>
              {customTranslations[lang]['home.description.and']}
              <span className="font-medium text-red-600 underline decoration-current decoration-wavy underline-offset-4">
                {customTranslations[lang]['home.description.slides']}
              </span>
              {customTranslations[lang]['home.description.period']}
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

        {/* Playground */}
        <section
          className={`
            relative min-h-120 w-full px-4
            md:min-h-200 md:px-12
          `}
        >
          <Univer />
        </section>

        {/* Customer */}
        <section className="text-center">
          <h3
            className={`
              mb-4 text-sm font-semibold text-neutral-800
              dark:text-neutral-400
            `}
          >
            {customTranslations[lang]['home.customer.title']}
          </h3>

          <div className="flex justify-center overflow-hidden">
            <Customer />
          </div>
        </section>
      </div>
    </>
  )
}
