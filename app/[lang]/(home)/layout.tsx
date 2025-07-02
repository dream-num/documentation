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
  }, {
    text: 'Univer Docs',
    url: `/${lang}/guides/docs`,
    className: 'lg:col-start-1',
    icon: <BookTextIcon />,
  }, {
    text: 'Univer Slides',
    url: `/${lang}/guides/slides`,
    className: 'lg:col-start-2 lg:row-start-1',
    icon: <PresentationIcon />,
  }, {
    text: 'Recipes',
    url: `/${lang}/guides/recipes`,
    className: 'lg:col-start-2 lg:row-start-2',
    icon: <CookingPotIcon />,
  }]

  const ecosystemLinks = [{
    text: '📦 Univer Icons',
    url: `/${lang}/icons`,
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
                className={link.className}
                href={link.url}
              >
                <div className="flex flex-col">
                  <div
                    className={`
                      mb-2 flex size-6 items-center justify-center rounded bg-primary text-white
                      [&>*]:size-4
                    `}
                  >
                    {link.icon}
                  </div>
                  <div className="font-medium">{link.text}</div>
                </div>
              </NavbarMenuLink>
            ))}

            <NavbarMenuLink
              className={`
                md:col-span-2 md:row-span-2
                lg:col-start-3 lg:row-start-1
              `}
            >
              right
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
