'use client'

import { useTranslation } from '@/hooks/i18n'
import { FeelbackTaggedMessage, PRESET_EVALUATION } from '@feelback/react'
import { usePathname } from 'next/navigation'

import '@feelback/react/styles/feelback.css'

export default function FeedbackMessage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'en-US': {
      title: 'Was this page helpful?',
      placeholder: 'Please leave your feedback here',
    },
    'zh-CN': {
      title: '这个页面对您有帮助吗？',
      placeholder: '请在这里留下您的反馈',
    },
  })

  return (
    <div
      className={`
        mt-8 flex-col items-center
        [&_.feelback-btn.btn-action]:mt-6! [&_.feelback-btn.btn-action]:rounded-md!
        [&_.feelback-btn.btn-action]:border-gray-200!
        dark:[&_.feelback-btn.btn-action]:border-gray-600! dark:[&_textarea]:border-gray-600
        [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-gray-200
        [&_textarea]:transition-all [&_textarea]:focus:border-gray-400 [&_textarea]:focus:outline-none
      `}
    >
      <FeelbackTaggedMessage
        contentSetId="f188ccef-f7c8-43a2-bea7-4c7f21bfcaf5"
        layout="inline"
        preset={PRESET_EVALUATION}
        title={t('title')}
        placeholder={t('placeholder')}
      />
    </div>
  )
}
