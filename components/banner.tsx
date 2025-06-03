'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Banner as NextraBanner } from 'nextra/components'
import { useTranslation } from '@/hooks/i18n'

interface IProps {
  version: string
}

export default function Banner(props: IProps) {
  const { version } = props

  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'zh-CN': {
      release: ' 版本已发布。',
      readmore: '查看详情 →',
    },
    'en-US': {
      release: ' is released.',
      readmore: 'Read more →',
    },
  })

  return (
    <NextraBanner>
      <span className="mr-1">
        🎉 Univer
        {' '}
        <em className="font-semibold not-italic">{version}</em>
        {' '}
        {t('release')}
      </span>
      <Link
        className="text-blue-400 underline"
        href={`https://github.com/dream-num/univer/releases/tag/v${version}`}
        target="_blank"
      >
        {t('readmore')}
      </Link>
    </NextraBanner>
  )
}
