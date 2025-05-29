import { useTranslation } from '@/hooks/i18n'
import { usePathname } from 'next/navigation'
import { Callout } from 'nextra/components'

export default function BusinessPlanNotice() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'en-US': {
      notice: 'This feature contains closed-source code, allowing any user to use it for free. It also includes an optional business upgrade plan that provides richer features and services.',
    },
    'zh-CN': {
      notice: '本功能包含闭源代码，允许任何用户免费商用。此外也包含了可选的商业升级计划，可提供更丰富的功能和服务。',
    },
  })

  return (
    <div className="mt-6">
      <Callout type="info" emoji="🏆">
        {t('notice')}
      </Callout>
    </div>
  )
}
