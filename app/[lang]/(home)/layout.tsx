import type { LinkItemType } from 'fumadocs-ui/layouts/shared'
import type { ReactNode } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar'
import { BookTextIcon, CookingPotIcon, PresentationIcon, SheetIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import { baseOptions } from '@/app/layout.config'
import { Footer } from '@/components/footer'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  const documentationLinks = [{
    text: 'Univer Sheets',
    url: `/guides/sheets`,
    className: 'lg:col-start-1',
    icon: <SheetIcon />,
    iconClassName: 'bg-linear-[135deg,#0DA471_0%,#F3FAF7_100%] dark:bg-linear-[135deg,#0DA471_0%,#014737_100%]',
  }, {
    text: 'Univer Docs',
    url: `/guides/docs`,
    className: 'lg:col-start-2',
    icon: <BookTextIcon />,
    iconClassName: 'bg-linear-[135deg,#3F83F8_0%,#EBF5FF_100%] dark:bg-linear-[135deg,#3F83F8_0%,#233876_100%]',
  }, {
    text: 'Univer Slides',
    url: '/guides/slides',
    className: 'lg:col-start-3',
    icon: <PresentationIcon />,
    iconClassName: 'bg-linear-[135deg,#F05252_0%,#FDF2F2_100%] dark:bg-linear-[135deg,#F05252_0%,#771D1D_100%]',
  }, {
    text: 'Recipes',
    url: '/guides/recipes/architecture/univer',
    className: 'lg:col-start-1 lg:row-start2',
    icon: <CookingPotIcon />,
    iconClassName: 'bg-linear-[135deg,#9061F9_0%,#F6F5FF_100%] dark:bg-linear-[135deg,#9061F9_0%,#4A1D96_100%]',
  }, {
    text: 'Univer Pro',
    url: '/guides/pro',
    className: 'md:hidden',
    icon: <StarIcon />,
  }]

  const links: LinkItemType[] = [
    {
      type: 'menu',
      on: 'menu',
      text: customTranslations[lang]['documentation.title'],
      items: documentationLinks,
    },
    {
      type: 'custom',
      on: 'nav',
      children: (
        <NavbarMenu>
          <NavbarMenuTrigger asChild>
            <Link href="/guides/sheets">
              {customTranslations[lang]['documentation.title']}
            </Link>
          </NavbarMenuTrigger>
          <NavbarMenuContent className="text-sm">
            {documentationLinks.map(link => (
              <NavbarMenuLink
                key={link.url}
                className={clsx('border-none', link.className)}
                href={link.url}
              >
                <div className="flex flex-col">
                  <div
                    className={clsx(`
                      mb-2 flex size-6 items-center justify-center rounded-sm text-white
                      *:size-4
                    `, link.iconClassName)}
                  >
                    {link.icon}
                  </div>
                  <div className="font-medium">{link.text}</div>
                </div>
              </NavbarMenuLink>
            ))}

            <NavbarMenuLink
              className={`
                group relative overflow-hidden rounded-2xl border-none shadow-[0_25px_60px_rgba(15,23,42,0.25)]
                transition-transform duration-200
                hover:-translate-y-1
                md:col-span-2 md:row-span-2
                lg:col-start-4 lg:row-start-1
                [&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:transition-transform
                hover:[&>img]:scale-[1.02]
              `}
              href="/guides/pro"
            >
              <img
                className={`
                  hidden
                  dark:block
                `}
                src="/assets/images/pro-panel.dark.png"
                alt={customTranslations[lang]['navbar.pro.title']}
              />
              <img
                className={`
                  block
                  dark:hidden
                `}
                src="/assets/images/pro-panel.light.png"
                alt={customTranslations[lang]['navbar.pro.title']}
              />
              <div
                className={`
                  absolute inset-0
                  bg-linear-[135deg,rgba(15,23,42,0.9)_0%,rgba(15,23,42,0.55)_45%,rgba(15,23,42,0.15)_100%]
                  dark:bg-linear-[135deg,rgba(2,6,23,0.75)_0%,rgba(2,6,23,0.45)_45%,rgba(2,6,23,0.1)_100%]
                `}
              />
              <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between text-xs tracking-[0.28em] text-white/70 uppercase">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/90">
                    {customTranslations[lang]['navbar.pro.badge']}
                  </span>
                  <span>{customTranslations[lang]['navbar.pro.kicker']}</span>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{customTranslations[lang]['navbar.pro.title']}</div>
                  <p className="mt-2 text-sm text-white/80">
                    {customTranslations[lang]['navbar.pro.description']}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  {customTranslations[lang]['navbar.pro.cta']}
                  <span
                    className="
                      transition-transform duration-200
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </div>
              </div>
            </NavbarMenuLink>
          </NavbarMenuContent>
        </NavbarMenu>
      ),
    },
    {
      text: customTranslations[lang]['reference.title'],
      url: '/reference/classes/univer',
    },
    {
      text: customTranslations[lang]['blog.title'],
      url: '/blog',
    },
    {
      text: customTranslations[lang]['icons.title'],
      url: `/icons`,
    },
    {
      text: customTranslations[lang]['showcase.title'],
      url: '/showcase',
    },
  ]

  return (
    <HomeLayout
      className="min-h-screen"
      {...baseOptions(lang)}
      links={links}
    >
      {children}

      <Footer />
    </HomeLayout>
  )
}
