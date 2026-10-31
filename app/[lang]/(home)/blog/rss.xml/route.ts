import { Feed } from 'feed'
import { NextResponse } from 'next/server'
import { getContentLocale, stripLocalePrefix, withLocale } from '@/lib/locale-path'
import { getActiveBlogPages } from '@/lib/source'

export const revalidate = false

const baseUrl = 'https://docs.univer.ai'

interface IProps {
  params: Promise<{ lang: string }>
}

export async function GET(request: Request, { params }: IProps) {
  const { lang } = await params

  const feed = new Feed({
    title: 'Univer Office SDK Blog',
    id: `${baseUrl}${withLocale(lang, '/blog')}`,
    link: `${baseUrl}${withLocale(lang, '/blog')}`,
    language: lang,
    copyright: 'All rights reserved 2025, ',
  })

  for (const page of getActiveBlogPages(lang).toSorted((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })) {
    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${withLocale(getContentLocale(page.path), stripLocalePrefix(page.url))}`,
      date: new Date(page.data.date),

      author: [
        {
          name: page.data.author,
        },
      ],
    })
  }

  return new NextResponse(feed.rss2())
}
