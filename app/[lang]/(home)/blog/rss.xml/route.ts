import process from 'node:process'
import { Feed } from 'feed'
import { NextResponse } from 'next/server'
import { i18nConfig } from '@/lib/i18n'
import { getActiveBlogPages } from '@/lib/source'

export const revalidate = false

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://univer.ai'
const baseUrl = siteUrl.replace(/\/$/, '')

interface IProps {
  params: Promise<{ lang: string }>
}

export function generateStaticParams(): Array<{ lang: string }> {
  return i18nConfig.languages.map(lang => ({ lang }))
}

export async function GET(_request: Request, { params }: IProps) {
  const { lang } = await params

  const feed = new Feed({
    title: 'Univer Blog',
    id: `${baseUrl}/blog`,
    link: `${baseUrl}/blog`,
    language: lang,
    copyright: 'All rights reserved 2025, ',
  })

  for (const page of getActiveBlogPages(lang).sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })) {
    feed.addItem({
      id: `${baseUrl}${page.url}`,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${page.url}`,
      date: new Date(page.data.date),

      author: [
        {
          name: page.data.author,
        },
      ],
    })
  }

  return new NextResponse(feed.rss2(), {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
    },
  })
}
