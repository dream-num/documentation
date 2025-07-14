import { Scaffolder } from '@/packages/scaffolder'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Univer Scaffolder',
  description: 'Create Univer applications with ease',
}

export default async function Page({ params }: IProps) {
  const { lang: _lang } = await params

  return (
    <div
      className={`
        container
        max-sm:px-0
        md:py-12
      `}
    >
      <Scaffolder />
    </div>
  )
}
