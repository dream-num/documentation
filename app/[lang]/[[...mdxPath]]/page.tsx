import type { Metadata } from 'next'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import FeedbackMessage from '@/components/feedback-message'
import { useMDXComponents } from '@/mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath, params.lang)

  return metadata
}

type PageProps = Readonly<{
  params: Promise<{
    mdxPath: string[]
    lang: string
  }>
}>
const Wrapper = useMDXComponents().wrapper

export default async function Page(props: PageProps) {
  const params = await props.params
  const result = await importPage(params.mdxPath, params.lang)
  const { default: MDXContent, toc, metadata } = result

  return (
    <>
      <Wrapper toc={toc} metadata={metadata}>
        <MDXContent {...props} params={params} />

        <footer className="pt-10">
          <hr
            className={`
              border-gray-200
              dark:border-gray-600
            `}
          />

          <FeedbackMessage />
        </footer>
      </Wrapper>
    </>
  )
}
