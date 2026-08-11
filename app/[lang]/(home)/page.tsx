import { BookTextIcon, FerrisWheelIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import type { Locale } from '@/i18n/routing'
import BlurryBlob from '@/components/animata/blurry-blob'
import { Footer } from '@/components/footer'
import { DeveloperExperience } from '@/components/home/developer-experience'
import { Ecosystem } from '@/components/home/ecosystem'
import { EnterprisePerformance } from '@/components/home/enterprise-performance'
import { Headless } from '@/components/home/headless'
import { LogoCloud } from '@/components/home/logo-cloud'
import { Scenes } from '@/components/home/scenes'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BlurFade } from '@/components/magicui/blur-fade'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import Univer from '@/components/univer'
import pkg from '@/package.json'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: 'Univer',
    description: t('home.description'),
  }
}

export default async function Page({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return (
    <>
      {/* Spotlight */}
      <div className="fixed inset-0 z-1 size-full overflow-hidden">
        <div className="relative container size-full">
          <div className="absolute top-1/3 left-1/6">
            <BlurryBlob
              className={`rounded-xl opacity-50 dark:opacity-35`}
              firstBlobColor="bg-[#7AB0FF] dark:bg-[#0048FF]"
              secondBlobColor="bg-[#6BB5F7] dark:bg-[#0C81ED]"
            />
          </div>
          <div className="absolute right-1/7 bottom-0 rotate-90">
            <BlurryBlob
              className="rounded-xl opacity-45"
              firstBlobColor="bg-[#66DDD6] dark:bg-[#00BBB0]"
              secondBlobColor="bg-[#66D4E8] dark:bg-[#029DCE]"
            />
          </div>
          <div className="absolute -bottom-1/6 left-0">
            <BlurryBlob
              className="rounded-xl opacity-25"
              firstBlobColor="bg-[#80E5D4] dark:bg-[#00C5A8]"
              secondBlobColor="bg-[#7AB0FF] dark:bg-[#0048FF]"
            />
          </div>
        </div>
      </div>

      <div className={`relative z-1 flex flex-col items-center gap-16 py-8 md:py-12`}>
        {/* Hero */}
        <BlurFade duration={0.2}>
          <header className={`relative px-4 pt-12 pb-24 md:pt-36`}>
            <div className="mb-6 text-center">
              <Link
                className={`mx-auto inline-block rounded-full bg-neutral-50 py-1 text-sm font-semibold shadow-sm transition-colors hover:bg-neutral-100 dark:bg-neutral-800 hover:dark:bg-neutral-900`}
                href={`https://github.com/dream-num/univer/releases/tag/v${pkg.version}`}
              >
                <span className={`border-r border-neutral-300 py-1 pr-1.5 pl-3 dark:border-neutral-700`}>🎉</span>
                <AnimatedShinyText className="py-1 pr-3 pl-1.5">
                  Univer v{pkg.version} {t('home.banner-release')}
                </AnimatedShinyText>
              </Link>
            </div>

            <h1
              className={`mx-auto mb-6 max-w-3xl bg-linear-to-br from-black from-30% to-black/40 bg-clip-text text-center text-3xl font-semibold text-transparent md:text-4xl lg:text-6xl dark:from-white dark:to-white/40`}
            >
              {t('home.slogan')}
            </h1>

            <p
              className={`mx-auto mb-10 max-w-3xl text-center text-base text-neutral-600 md:text-lg dark:text-neutral-300`}
            >
              {t('home.description')}
              <span className="font-medium text-green-600 underline decoration-current decoration-wavy underline-offset-4">
                {t('home.description-sheets')}
              </span>
              {t('home.description-split')}
              <span className="font-medium text-blue-600 underline decoration-current decoration-wavy underline-offset-4">
                {t('home.description-docs')}
              </span>
              {t('home.description-and')}
              <span className="font-medium text-red-600 underline decoration-current decoration-wavy underline-offset-4">
                {t('home.description-slides')}
              </span>
              {t('home.description-period')}
            </p>

            <div className="flex justify-center gap-4">
              <RainbowButton render={<Link href="/guides/sheets" />}>
                <BookTextIcon />
                {t('navigation.documentation')}
              </RainbowButton>
              <RainbowButton variant="outline" render={<Link href="/showcase" />}>
                <FerrisWheelIcon />
                {t('navigation.showcase')}
              </RainbowButton>
            </div>
          </header>
        </BlurFade>

        {/* Playground */}
        <section className={`relative min-h-120 w-full px-4 md:min-h-200 md:px-12`}>
          <Univer />
        </section>

        {/* Logo Cloud */}
        <LogoCloud title={t('home.logocloud.title')} />

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
          dataTitle={t('home.scenes.data.title')}
          dataDesc={t('home.scenes.data.desc')}
          collabTitle={t('home.scenes.collab.title')}
          collabDesc={t('home.scenes.collab.desc')}
          automationTitle={t('home.scenes.automation.title')}
          automationDesc={t('home.scenes.automation.desc')}
          proBadge={t('home.pro.badge')}
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
          proBadge={t('home.pro.badge')}
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
        />

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
      <Footer className="relative z-1 mt-8" />
    </>
  )
}
