import { useTranslation } from '@/hooks/i18n'
import { usePathname } from 'next/navigation'

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
