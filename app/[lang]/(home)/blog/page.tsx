import { createRelativeLink } from 'fumadocs-ui/mdx'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blog } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Blog',
  description: 'Blog posts about Univer',
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  const posts = [...blog.getPages()].sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })

  // const { slug, lang } = await params
  // const page = blog.getPage(slug, lang)
  // if (!page) {
  //   notFound()
  // }

  // const MDXContent = page.data.body

  // return (
  //   <DocsPage toc={page.data.toc} full={page.data.full}>
  //     <DocsTitle>{page.data.title}</DocsTitle>
  //     <DocsDescription>{page.data.description}</DocsDescription>
  //     <DocsBody>
  //       <MDXContent
  //         components={getMDXComponents({
  //           // this allows you to link to other pages with relative file paths
  //           a: createRelativeLink(blog, page),
  //         })}
  //       />
  //     </DocsBody>
  //   </DocsPage>
  // )
  return (
    <main className="">
      <h1 className="mb-4 text-2xl font-bold">Blog</h1>

      <pre>
        {posts.map(post => (
          <div key={post.url}>
            <Link href={post.url}>
              {JSON.stringify(post, null, 2)}
            </Link>
          </div>
        ))}
      </pre>
    </main>
  )
}
