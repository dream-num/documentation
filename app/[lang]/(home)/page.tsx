import {
  ArrowRightIcon,
  BookTextIcon,
  FerrisWheelIcon,
  FileInputIcon,
  PuzzleIcon,
  ServerIcon,
  UsersIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { Footer } from '@/components/footer'
import { ClosingCTA } from '@/components/home/closing-cta'
import { DeveloperExperience } from '@/components/home/developer-experience'
import { Ecosystem } from '@/components/home/ecosystem'
import { EnterprisePerformance } from '@/components/home/enterprise-performance'
import { HeadingGlow } from '@/components/home/heading-glow'
import { Headless } from '@/components/home/headless'
import { LogoCloud } from '@/components/home/logo-cloud'
import { Scenes } from '@/components/home/scenes'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { UniverIcon } from '@/components/univer-icon'
import Univer from '@/components/univer/client'
import { Link } from '@/i18n/navigation'
import pkg from '@/package.json'

const circuitProducts = [
  {
    id: 'sheets',
    icon: 'SheetsAppIcon',
    laserClass: 'text-[#35BD4B] [--laser-delay:0.0s]',
    trackClass: 'opacity-25',
    positionClass: 'left-[17.5%] top-[17.5%]',
    path: 'M280 112H208Q196 112 188 120L108 200Q96 212 96 224V320',
  },
  {
    id: 'docs',
    icon: 'DocsAppIcon',
    laserClass: 'text-[#4B7DFF] [--laser-delay:-1.3s]',
    trackClass: 'opacity-20',
    positionClass: 'left-[6%] top-[50%]',
    path: 'M96 320H152Q160 320 166 326L234 394Q240 400 240 408V512',
  },
  {
    id: 'slides',
    icon: 'SlidesAppIcon',
    laserClass: 'text-[#FF6B4B] [--laser-delay:-2.6s]',
    trackClass: 'opacity-30',
    positionClass: 'left-[15%] top-[80%]',
    path: 'M240 512V552Q240 560 234 566L208 592Q202 598 194 598H-64',
  },
  {
    id: 'bases',
    icon: 'BasesAppIcon',
    laserClass: 'text-[#14B8A6] [--laser-delay:-3.9s]',
    trackClass: 'opacity-20',
    positionClass: 'left-[86%] top-[25%]',
    path: 'M1376 160H1440Q1448 160 1454 166L1498 210Q1504 216 1504 224V352',
  },
  {
    id: 'boards',
    icon: 'BoardsAppIcon',
    laserClass: 'text-[#8B5CF6] [--laser-delay:-5.2s]',
    trackClass: 'opacity-30',
    positionClass: 'left-[94%] top-[55%]',
    path: 'M1504 352V408Q1504 416 1498 422L1406 514Q1400 520 1392 520H1328',
  },
  {
    id: 'pdf',
    icon: 'PdfAppIcon',
    laserClass: 'text-[#E5484D] [--laser-delay:-6.5s]',
    trackClass: 'opacity-25',
    positionClass: 'left-[83%] top-[81.25%]',
    path: 'M1328 520V568Q1328 576 1334 582L1358 606Q1364 612 1372 612H1664',
  },
] as const

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: { absolute: 'Univer Office SDK' },
    description: t('home.description'),
  }
}

export default async function Page({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  const serverModules = [
    {
      key: 'collaboration',
      icon: UsersIcon,
      title: t('home.server.collaboration.title'),
      description: t('home.server.collaboration.description'),
      href: '/server/collaboration/overview',
    },
    {
      key: 'conversion',
      icon: FileInputIcon,
      title: t('home.server.conversion.title'),
      description: t('home.server.conversion.description'),
      href: '/server/import-export',
    },
    {
      key: 'extensions',
      icon: PuzzleIcon,
      title: t('home.server.extensions.title'),
      description: t('home.server.extensions.description'),
      href: '/server/collaboration/extensions',
    },
  ]

  return (
    <div className="relative isolate bg-white text-(--landing-ink) [--landing-card:#fff] [--landing-ink:#303139] [--landing-line:#dfe0e5] [--landing-muted:#6e707b] [--landing-surface:#fff] dark:bg-[#101113] dark:[--landing-card:#25272b] dark:[--landing-ink:#eeeef1] dark:[--landing-line:#34363b] dark:[--landing-muted:#a1a1aa] dark:[--landing-surface:#151618]">
      <HeadingGlow />
      <main>
        <header className="relative isolate overflow-hidden px-6 pt-16 pb-10 text-center lg:px-[20%] lg:pt-24 lg:pb-24">
          <div className="mx-auto inline-block rounded-full bg-neutral-50 py-1 text-sm font-semibold shadow-sm dark:bg-neutral-800">
            <span className="border-r border-neutral-300 py-1 pr-1.5 pl-3 dark:border-neutral-700">🎉</span>
            <AnimatedShinyText className="py-1 pr-3 pl-1.5">
              Univer Office SDK v{pkg.version} {t('home.banner-release')}
            </AnimatedShinyText>
          </div>
          <h1 className="mx-auto my-6 max-w-225 text-[clamp(36px,5vw,70px)] leading-[1.14] font-normal tracking-[-0.045em] text-balance md:tracking-[-0.05em]">
            {t('home.slogan')
              .split('\n')
              .map((phrase) => (
                <span key={phrase} className="inline-block">
                  {phrase}
                </span>
              ))}
          </h1>
          <p className="mx-auto max-w-187.5 text-[13px] leading-[1.85] text-pretty text-(--landing-muted) md:text-[15px]">
            {t('home.description')}
            <span className="font-medium whitespace-nowrap text-green-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.description-sheets')}
            </span>
            {t('home.description-split')}
            <span className="font-medium whitespace-nowrap text-blue-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.description-docs')}
            </span>
            {t('home.description-split')}
            <span className="font-medium whitespace-nowrap text-orange-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.description-slides')}
            </span>
            {t('home.description-split')}
            <span className="font-medium whitespace-nowrap text-teal-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.scenes.bases.title')}
            </span>
            {t('home.description-split')}
            <span className="font-medium whitespace-nowrap text-violet-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.scenes.boards.title')}
            </span>
            {t('home.description-and')}
            <span className="font-medium whitespace-nowrap text-red-600 underline decoration-current decoration-wavy underline-offset-4">
              {t('home.scenes.pdf.title')}
            </span>
            {t('home.description-period')}
          </p>
          <div className="mt-7.5 flex flex-wrap justify-center gap-4">
            <RainbowButton render={<Link href="/guides/sheets" />}>
              <BookTextIcon />
              {t('navigation.documentation')}
            </RainbowButton>
            <RainbowButton variant="outline" render={<Link href="https://office.univer.ai" />}>
              <FerrisWheelIcon />
              {t('navigation.showcase')}
            </RainbowButton>
          </div>
          <div
            className="pointer-events-none absolute inset-0 -z-10 hidden lg:block dark:opacity-70"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 1600 640"
              preserveAspectRatio="none"
              fill="none"
              className="size-full [&_path]:[vector-effect:non-scaling-stroke] [&_use]:[vector-effect:non-scaling-stroke]"
            >
              <path
                d="M448-48V40Q448 48 442 54L390 106Q384 112 376 112H280M1664 16H1448Q1440 16 1434 22L1382 74Q1376 80 1376 88V160"
                className="stroke-(--landing-muted) stroke-[1.3] opacity-15 [stroke-linecap:round]"
              />
              <path d="M-64 320H96M1504 352H1664" className="stroke-(--landing-muted) stroke-[1.3] opacity-10" />
              {circuitProducts.map((product) => (
                <g key={product.id} className={product.laserClass}>
                  <defs>
                    <path id={`circuit-${product.id}`} d={product.path} pathLength="1000" />
                  </defs>
                  <use
                    href={`#circuit-${product.id}`}
                    className={`stroke-(--landing-muted) stroke-[1.3] [stroke-linecap:round] ${product.trackClass}`}
                  />
                  <use
                    href={`#circuit-${product.id}`}
                    className="animate-circuit-flow stroke-current stroke-[1.8] drop-shadow-[0_0_3px_currentColor] [stroke-dasharray:45_955] [stroke-linecap:round] motion-reduce:animate-none motion-reduce:opacity-25 motion-reduce:[stroke-dasharray:none]"
                  />
                </g>
              ))}
            </svg>
            {circuitProducts.map((product) => (
              <svg
                key={product.id}
                data-circuit-product={product.id}
                viewBox="-30 -30 60 60"
                fill="none"
                className={`absolute size-14 -translate-1/2 overflow-visible ${product.positionClass}`}
              >
                <g className="stroke-(--landing-line) stroke-[1.2]">
                  <path d="M-30-10H-20M-30 0H-20M-30 10H-20M20-10H30M20 0H30M20 10H30M-10-30V-20M0-30V-20M10-30V-20M-10 20V30M0 20V30M10 20V30" />
                  <rect
                    x="-23"
                    y="-23"
                    width="46"
                    height="46"
                    rx="9"
                    className="fill-(--landing-surface) stroke-(--landing-card) stroke-3 drop-shadow-[0_2px_3px_#30313912]"
                  />
                  <rect x="-17" y="-17" width="34" height="34" rx="5" className="fill-(--landing-surface)" />
                  <UniverIcon
                    name={product.icon}
                    x={-11}
                    y={-11}
                    width={22}
                    height={22}
                    className="stroke-none text-(--landing-muted)"
                  />
                </g>
              </svg>
            ))}
          </div>
        </header>

        <section
          id="playground"
          aria-label={t('home.examples.eyebrow')}
          className="mx-auto mb-4 w-[calc(100%-24px)] max-w-7xl scroll-mt-25 md:mb-8 md:w-[calc(100%-64px)]"
        >
          <Univer tablistLabel={t('home.examples.eyebrow')} />
        </section>
        <div className="overflow-hidden px-5 pt-11 pb-3 md:pt-16 [&_section]:mb-0 [&_section>div]:flex-wrap [&_section>div]:gap-y-7 [&>div]:max-w-full">
          <LogoCloud title={t('home.logocloud.title')} />
        </div>

        <div
          data-home-features
          className="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 pt-14 pb-20 md:gap-32 md:pt-19 md:pb-28 [&_h2]:text-[clamp(28px,3vw,40px)] [&_h2]:font-normal [&_h2]:tracking-[-0.04em] [&_h2]:text-balance [&_section]:w-full [&_section]:max-w-none [&_section]:px-0 [&>div]:w-full"
        >
          {/* Scenes */}
          <Scenes
            title={t('home.scenes.title')}
            subtitle={t('home.scenes.subtitle')}
            sheetsTitle={t('home.scenes.sheets.title')}
            sheetsDesc={t('home.scenes.sheets.desc')}
            docsTitle={t('home.scenes.docs.title')}
            docsDesc={t('home.scenes.docs.desc')}
            slidesTitle={t('home.scenes.slides.title')}
            slidesDesc={t('home.scenes.slides.desc')}
            basesTitle={t('home.scenes.bases.title')}
            basesDesc={t('home.scenes.bases.desc')}
            boardsTitle={t('home.scenes.boards.title')}
            boardsDesc={t('home.scenes.boards.desc')}
            pdfTitle={t('home.scenes.pdf.title')}
            pdfDesc={t('home.scenes.pdf.desc')}
          />

          {/* Developer Experience */}
          <DeveloperExperience
            title={t('home.devexp.title')}
            subtitle={t('home.devexp.subtitle')}
            step1Title={t('home.devexp.step1.title')}
            step1Desc={t('home.devexp.step1.desc')}
            step2Title={t('home.devexp.step2.title')}
            step2Desc={t('home.devexp.step2.desc')}
            step3Title={t('home.devexp.step3.title')}
            step3Desc={t('home.devexp.step3.desc')}
            step4Title={t('home.devexp.step4.title')}
            step4Desc={t('home.devexp.step4.desc')}
            copyLabel={t('home.devexp.copy')}
            copiedLabel={t('home.devexp.copied')}
            presetLabel={t('home.devexp.preset.label')}
            pluginLabel={t('home.devexp.plugin.label')}
          />

          {/* Enterprise Performance */}
          <EnterprisePerformance
            title={t('home.enterprise.title')}
            subtitle={t('home.enterprise.subtitle')}
            metric1Label={t('home.enterprise.metric1.label')}
            metric1Value={0.27}
            metric1Suffix={t('home.enterprise.metric1.suffix')}
            metric2Label={t('home.enterprise.metric2.label')}
            metric2Value={60}
            metric2Suffix={t('home.enterprise.metric2.suffix')}
            metric3Label={t('home.enterprise.metric3.label')}
            metric3Value={1.3}
            metric3Suffix={t('home.enterprise.metric3.suffix')}
            metric4Label={t('home.enterprise.metric4.label')}
            metric4Value={200}
            metric4Suffix={t('home.enterprise.metric4.suffix')}
            feature1Title={t('home.enterprise.feature1.title')}
            feature1Desc={t('home.enterprise.feature1.desc')}
            feature2Title={t('home.enterprise.feature2.title')}
            feature2Desc={t('home.enterprise.feature2.desc')}
            feature3Title={t('home.enterprise.feature3.title')}
            feature3Desc={t('home.enterprise.feature3.desc')}
            feature4Title={t('home.enterprise.feature4.title')}
            feature4Desc={t('home.enterprise.feature4.desc')}
            feature5Title={t('home.enterprise.feature5.title')}
            feature5Desc={t('home.enterprise.feature5.desc')}
            feature6Title={t('home.enterprise.feature6.title')}
            feature6Desc={t('home.enterprise.feature6.desc')}
            feature7Title={t('home.enterprise.feature7.title')}
            feature7Desc={t('home.enterprise.feature7.desc')}
            feature8Title={t('home.enterprise.feature8.title')}
            feature8Desc={t('home.enterprise.feature8.desc')}
            feature9Title={t('home.enterprise.feature9.title')}
            feature9Desc={t('home.enterprise.feature9.desc')}
            feature10Title={t('home.enterprise.feature10.title')}
            feature10Desc={t('home.enterprise.feature10.desc')}
            feature11Title={t('home.enterprise.feature11.title')}
            feature11Desc={t('home.enterprise.feature11.desc')}
            feature12Title={t('home.enterprise.feature12.title')}
            feature12Desc={t('home.enterprise.feature12.desc')}
          />

          {/* Headless */}
          <Headless
            title={t('home.headless.title')}
            subtitle={t('home.headless.subtitle')}
            feature1Title={t('home.headless.feature1.title')}
            feature1Desc={t('home.headless.feature1.desc')}
            feature2Title={t('home.headless.feature2.title')}
            feature2Desc={t('home.headless.feature2.desc')}
            feature3Title={t('home.headless.feature3.title')}
            feature3Desc={t('home.headless.feature3.desc')}
            feature4Title={t('home.headless.feature4.title')}
            feature4Desc={t('home.headless.feature4.desc')}
            copyLabel={t('home.devexp.copy')}
            copiedLabel={t('home.devexp.copied')}
            pluginLabel={t('home.devexp.plugin.label')}
            presetLabel={t('home.devexp.preset.label')}
          />

          <section
            id="server-sdk"
            aria-labelledby="server-sdk-title"
            className="grid scroll-mt-24 items-center gap-10 border-y border-(--landing-line) py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-16"
          >
            <div>
              <h2 id="server-sdk-title">{t('home.server.title')}</h2>
              <p className="mt-5 max-w-md text-sm/relaxed text-(--landing-muted)">{t('home.server.description')}</p>
              <Link
                href="/server"
                className="mt-7 inline-flex items-center gap-2 rounded-sm text-sm font-medium transition-colors hover:text-(--landing-muted) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--landing-ink)"
              >
                {t('home.server.cta')}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <ServerIcon className="size-6 shrink-0 text-(--landing-muted)" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold">{t('home.server.application.title')}</h3>
                  <p className="mt-2 text-sm/relaxed text-(--landing-muted)">
                    {t('home.server.application.description')}
                  </p>
                </div>
              </div>
              <div className="ml-3 border-l border-(--landing-line) pt-3 pl-7">
                {serverModules.map((module) => (
                  <Link
                    key={module.key}
                    href={module.href}
                    className="group relative flex items-start gap-4 border-b border-(--landing-line) py-5 transition-colors before:absolute before:top-8 before:-left-7 before:h-px before:w-4 before:bg-(--landing-line) last:border-b-0 hover:text-(--landing-muted) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--landing-ink)"
                  >
                    <module.icon className="mt-0.5 size-5 shrink-0 text-(--landing-muted)" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{module.title}</h3>
                      <p className="mt-2 text-sm/relaxed text-(--landing-muted)">{module.description}</p>
                    </div>
                    <ArrowRightIcon
                      className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Ecosystem */}
          <Ecosystem
            title={t('home.ecosystem.title')}
            subtitle={t('home.ecosystem.subtitle')}
            pluginsTitle={t('home.ecosystem.plugins.title')}
            pluginsDesc={t('home.ecosystem.plugins.desc')}
            pluginsCta={t('home.ecosystem.plugins.cta')}
            integrationsTitle={t('home.ecosystem.integrations.title')}
            integrationsDesc={t('home.ecosystem.integrations.desc')}
            integrationsCta={t('home.ecosystem.integrations.cta')}
            communityTitle={t('home.ecosystem.community.title')}
            communityDesc={t('home.ecosystem.community.desc')}
            communityCta={t('home.ecosystem.community.cta')}
          />
        </div>

        <ClosingCTA
          title={t('home.cta.title')}
          description={t('home.cta.description')}
          startLabel={t('home.cta.start')}
          demoLabel={t('navigation.showcase')}
        />
      </main>
      <Footer />
    </div>
  )
}
