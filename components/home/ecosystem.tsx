import { ArrowRightIcon, HeartIcon, PlugIcon, PuzzleIcon } from 'lucide-react'

import { BlurFade } from '@/components/magicui/blur-fade'
import { Link } from '@/i18n/navigation'

interface IEcosystemResource {
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

  const resources: IEcosystemResource[] = [
    {
      icon: <PuzzleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />,
      title: pluginsTitle,
      desc: pluginsDesc,
      cta: pluginsCta,
      href: '/guides/sheets/getting-started/quickstart',
    },
    {
      icon: <PlugIcon className="size-6 text-blue-600 dark:text-blue-400" />,
      title: integrationsTitle,
      desc: integrationsDesc,
      cta: integrationsCta,
      href: '/guides/sheets/getting-started/integrations/react',
    },
    {
      icon: <HeartIcon className="size-6 text-red-600 dark:text-red-400" />,
      title: communityTitle,
      desc: communityDesc,
      cta: communityCta,
      href: 'https://github.com/dream-num/univer',
    },
  ]

  return (
    <BlurFade inView>
      <section id="ecosystem" className="container scroll-mt-24 px-4">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {resources.map((resource, index) => (
            <BlurFade
              key={resource.title}
              inView
              delay={index * 0.08}
              className="h-full border-t border-(--landing-line)"
            >
              <div className="flex h-full flex-col gap-4 pt-6">
                <div className="flex items-center gap-3">
                  {resource.icon}
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{resource.title}</h3>
                </div>
                <p className="text-sm/relaxed text-neutral-600 dark:text-neutral-400">{resource.desc}</p>
                <Link
                  href={resource.href}
                  target={resource.href.startsWith('http') ? '_blank' : undefined}
                  className="mt-auto inline-flex items-center gap-1 self-start rounded-sm pt-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-neutral-300 hover:dark:text-neutral-100"
                >
                  {resource.cta}
                  <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}
