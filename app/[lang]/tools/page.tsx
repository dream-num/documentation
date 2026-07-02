import { redirect } from 'next/navigation'
import { withLocale } from '@/lib/locale-path'

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  redirect(withLocale(lang, '/tools/theme-customizer'))
}
