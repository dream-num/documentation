'use client'

import { useTranslation } from '@/hooks/i18n'
import { usePathname } from 'next/navigation'

export default function TocBackToTop() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'zh-CN': {
      content: '返回顶部',
    },
    'en-US': {
      content: 'Scroll to top',
    },
  })

  return t('content')
}
