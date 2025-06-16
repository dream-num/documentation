import { Feed } from 'feed'
import { NextResponse } from 'next/server'
import { blog } from '@/lib/source'

export const revalidate = false

const baseUrl = 'https://fumadocs.dev'

interface IProps {
  params: Promise<{ lang: string }>
}

export async function GET(request: Request, { params }: IProps) {
  const { lang } = await params

  const feed = new Feed({
    title: 'Univer Blog',
    id: `${baseUrl}/${lang}/blog`,
    link: `${baseUrl}/${lang}/blog`,
    language: lang,
    copyright: 'All rights reserved 2025, ',
  })

  for (const page of blog.getPages(lang).sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })) {
    feed.addItem({
      id: page.url,
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

  return new NextResponse(feed.rss2())
}
