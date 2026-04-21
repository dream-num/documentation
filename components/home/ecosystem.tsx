import { ArrowRightIcon, HeartIcon, PlugIcon, PuzzleIcon } from 'lucide-react'
import Link from 'next/link'
import { BlurFade } from '@/components/magicui/blur-fade'

interface EcosystemCard {
  icon: React.ReactNode
  title: string
  desc: string
  cta: string
  href: string
}

interface IProps {
  title: string
  subtitle: string
  pluginsTitle: string
  pluginsDesc: string
  pluginsCta: string
  integrationsTitle: string
  integrationsDesc: string
  integrationsCta: string
  communityTitle: string
  communityDesc: string
  communityCta: string
}

export function Ecosystem(props: IProps) {
  const {
    title,
    subtitle,
    pluginsTitle,
    pluginsDesc,
    pluginsCta,
    integrationsTitle,
    integrationsDesc,
    integrationsCta,
    communityTitle,
    communityDesc,
    communityCta,
  } = props

  const cards: EcosystemCard[] = [
    {
      icon: (
        <PuzzleIcon
          className="
            size-6 text-emerald-600
            dark:text-emerald-400
          "
        />
      ),
      title: pluginsTitle,
      desc: pluginsDesc,
      cta: pluginsCta,
      href: '/guides/sheets/getting-started/quickstart',
    },
    {
      icon: (
        <PlugIcon
          className="
            size-6 text-blue-600
            dark:text-blue-400
          "
        />
      ),
      title: integrationsTitle,
      desc: integrationsDesc,
      cta: integrationsCta,
      href: '/guides/sheets/getting-started/installation/react',
    },
    {
      icon: (
        <HeartIcon
          className="
            size-6 text-red-600
            dark:text-red-400
          "
        />
      ),
      title: communityTitle,
      desc: communityDesc,
      cta: communityCta,
      href: 'https://github.com/dream-num/univer',
    },
  ]

  return (
    <BlurFade inView>
      <section className="container px-4">
        <div className="mb-8 text-center">
          <h2
            className={`
              mb-2 text-2xl font-semibold text-neutral-900
              dark:text-neutral-100
            `}
          >
            {title}
          </h2>
          <p
            className="
              text-neutral-600
              dark:text-neutral-400
            "
          >
            {subtitle}
          </p>
        </div>

        <div
          className="
            grid gap-4
            md:grid-cols-3
          "
        >
          {cards.map((card, index) => (
            <BlurFade key={card.title} inView delay={index * 0.08} className="h-full">
              <div
                className={`
                  flex h-full flex-col gap-5 rounded-2xl bg-white/30 p-6 shadow-xs ring-4 ring-neutral-100/20
                  backdrop-blur-sm transition-colors ring-inset
                  hover:bg-white/50
                  dark:bg-neutral-900/50 dark:ring-neutral-600/20
                  dark:hover:bg-neutral-800/60
                `}
              >
                {card.icon}
                <div>
                  <h3
                    className="
                      text-sm font-semibold text-neutral-800
                      dark:text-neutral-200
                    "
                  >
                    {card.title}
                  </h3>
                  <p
                    className="
                      mt-2 text-sm/relaxed text-neutral-600
                      dark:text-neutral-400
                    "
                  >
                    {card.desc}
                  </p>
                </div>
                <Link
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  className={`
                    mt-auto inline-flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors
                    hover:text-neutral-900
                    dark:text-neutral-300
                    dark:hover:text-neutral-100
                  `}
                >
                  {card.cta}
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}
