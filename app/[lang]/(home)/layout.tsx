import type { LinkItemType } from 'fumadocs-ui/layouts/links'
import type { ReactNode } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar'
import { BookTextIcon, CookingPotIcon, PresentationIcon, SheetIcon } from 'lucide-react'
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
    url: `/${lang}/guides/sheets`,
    className: 'lg:col-start-1',
    icon: <SheetIcon />,
    iconClassName: 'bg-linear-[135deg,#0DA471_0%,#F3FAF7_100%] dark:bg-linear-[135deg,#0DA471_0%,#014737_100%]',
  }, {
    text: 'Univer Docs',
    url: `/${lang}/guides/docs`,
    className: 'lg:col-start-1',
    icon: <BookTextIcon />,
    iconClassName: 'bg-linear-[135deg,#3F83F8_0%,#EBF5FF_100%] dark:bg-linear-[135deg,#3F83F8_0%,#233876_100%]',
  }, {
    text: 'Univer Slides',
    url: `/${lang}/guides/slides`,
    className: 'lg:col-start-2 lg:row-start-1',
    icon: <PresentationIcon />,
    iconClassName: 'bg-linear-[135deg,#F05252_0%,#FDF2F2_100%] dark:bg-linear-[135deg,#F05252_0%,#771D1D_100%]',
  }, {
    text: 'Recipes',
    url: `/${lang}/guides/recipes/architecture/univer`,
    className: 'lg:col-start-2 lg:row-start-2',
    icon: <CookingPotIcon />,
    iconClassName: 'bg-linear-[135deg,#9061F9_0%,#F6F5FF_100%] dark:bg-linear-[135deg,#9061F9_0%,#4A1D96_100%]',
  }]

  const ecosystemLinks = [{
    text: '📦 Univer Icons',
    url: `/${lang}/icons`,
  }, {
    text: '💎 Obsidian Univer Plugin',
    url: 'https://github.com/dream-num/obsidian-univer',
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
            <Link href={`/${lang}/guides/sheets`}>
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
                      mb-2 flex size-6 items-center justify-center rounded text-white
                      [&>*]:size-4
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
                relative overflow-hidden border-none
                md:col-span-2 md:row-span-2
                lg:col-start-3 lg:row-start-1
                [&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:transition-all
                hover:[&>img]:grayscale-50
              `}
              href={`/${lang}/guides/pro`}
            >
              <img
                className={`
                  hidden
                  dark:block
                `}
                src="/assets/images/pro-panel.dark.png"
                alt="Univer Pro"
              />
              <img
                className={`
                  block
                  dark:hidden
                `}
                src="/assets/images/pro-panel.light.png"
                alt="Univer Pro"
              />
              <label
                className={`
                  absolute top-4 left-4 inline-block rounded-md bg-linear-[90deg,#272A2F_0%,#7D8698_100%] px-3 py-1
                  text-lg font-semibold text-gray-100
                  dark:bg-linear-[90deg,#EEEFF1_0%,#7D8698_100%] dark:text-gray-700
                `}
              >
                Univer Pro
              </label>
            </NavbarMenuLink>
          </NavbarMenuContent>
        </NavbarMenu>
      ),
    },
    {
      type: 'menu',
      on: 'menu',
      text: customTranslations[lang]['ecosystem.title'],
      items: ecosystemLinks,
    },
    {
      type: 'custom',
      on: 'nav',
      children: (
        <NavbarMenu>
          <NavbarMenuTrigger asChild>
            <button className="cursor-pointer" type="button">
              {customTranslations[lang]['ecosystem.title']}
            </button>
          </NavbarMenuTrigger>
          <NavbarMenuContent className="text-sm">
            {ecosystemLinks.map(link => (
              <NavbarMenuLink
                key={link.url}
                href={link.url}
              >
                <span className="relative">{link.text}</span>
              </NavbarMenuLink>
            ))}
          </NavbarMenuContent>
        </NavbarMenu>
      ),
    },
    {
      text: customTranslations[lang]['blog.title'],
      url: `/${lang}/blog`,
    },
    {
      text: customTranslations[lang]['showcase.title'],
      url: `/${lang}/showcase`,
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
