import type { LinkItemType } from 'fumadocs-ui/layouts/links'
import type { ReactNode } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar'
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
    text: '📊 Univer Sheets',
    url: `/${lang}/guides/sheets`,
  }, {
    text: '📝 Univer Docs',
    url: `/${lang}/guides/docs`,
  }, {
    text: '📽️ Univer Slides',
    url: `/${lang}/guides/slides`,
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
