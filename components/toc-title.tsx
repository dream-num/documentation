import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/i18n'

export default function TocTitle() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'zh-CN': {
      content: '目录',
    },
    'en-US': {
      content: 'Contents',
    },
  })

  return t('content')
}
