'use client'

import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/i18n'

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
