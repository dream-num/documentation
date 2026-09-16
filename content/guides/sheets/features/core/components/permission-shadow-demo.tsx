'use client'

import { EyeOff } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface IShadowDemoLabels {
  title: string
  description: string
  strategy: string
  areas: [string, string, string, string]
  shadow: string
  clear: string
  note: string
}

const labels: Record<string, IShadowDemoLabels> = {
  'en-US': {
    title: 'Protection shadow preview',
    description: 'Compare the same areas under different strategies for the current user.',
    strategy: 'Shadow strategy',
    areas: ['Unprotected', 'Protected · editable', 'Protected · read-only', 'Protected · not viewable'],
    shadow: 'Shadow shown',
    clear: 'No shadow',
    note: 'Illustration only: changing the shadow does not change permissions. Hidden content stays hidden, even with none.',
  },
  'zh-CN': {
    title: '权限阴影示意',
    description: '切换策略，比较同一组区域对当前用户的显示效果。',
    strategy: '阴影策略',
    areas: ['未保护', '已保护 · 可编辑', '已保护 · 只读', '已保护 · 不可查看'],
    shadow: '显示阴影',
    clear: '无阴影',
    note: '此示意只改变阴影，不改变权限。即使选择 none，不可查看的内容也不会显示。',
  },
  'zh-TW': {
    title: '權限陰影示意',
    description: '切換策略，比較同一組區域對目前使用者的顯示效果。',
    strategy: '陰影策略',
    areas: ['未保護', '已保護 · 可編輯', '已保護 · 唯讀', '已保護 · 不可檢視'],
    shadow: '顯示陰影',
    clear: '無陰影',
    note: '此示意只改變陰影，不改變權限。即使選擇 none，不可檢視的內容也不會顯示。',
  },
  'ja-JP': {
    title: '保護シャドウのプレビュー',
    description: '戦略を切り替えて、現在のユーザーに同じ領域がどう表示されるか比較できます。',
    strategy: 'シャドウ戦略',
    areas: ['保護なし', '保護あり・編集可', '保護あり・読み取り専用', '保護あり・閲覧不可'],
    shadow: 'シャドウあり',
    clear: 'シャドウなし',
    note: 'これは表示の模式図です。シャドウを変えても権限は変わりません。none を選んでも閲覧できない内容は表示されません。',
  },
  'ko-KR': {
    title: '보호 음영 미리보기',
    description: '전략을 전환하여 현재 사용자에게 동일한 영역이 어떻게 표시되는지 비교하세요.',
    strategy: '음영 전략',
    areas: ['보호 없음', '보호됨 · 편집 가능', '보호됨 · 읽기 전용', '보호됨 · 보기 불가'],
    shadow: '음영 표시',
    clear: '음영 없음',
    note: '표시 방식을 설명하는 예시입니다. 음영을 바꿔도 권한은 바뀌지 않으며, none을 선택해도 볼 수 없는 내용은 표시되지 않습니다.',
  },
  'fr-FR': {
    title: 'Aperçu de l’ombrage de protection',
    description: 'Comparez l’affichage des mêmes zones pour l’utilisateur actuel selon la stratégie.',
    strategy: 'Stratégie d’ombrage',
    areas: ['Sans protection', 'Protégée · modifiable', 'Protégée · lecture seule', 'Protégée · non consultable'],
    shadow: 'Avec ombrage',
    clear: 'Sans ombrage',
    note: 'Illustration : changer l’ombrage ne modifie pas les droits. Le contenu non consultable reste masqué, même avec none.',
  },
  'es-ES': {
    title: 'Vista previa de las sombras de protección',
    description: 'Compara las mismas áreas para el usuario actual con distintas estrategias.',
    strategy: 'Estrategia de sombra',
    areas: ['Sin protección', 'Protegida · editable', 'Protegida · solo lectura', 'Protegida · no visible'],
    shadow: 'Con sombra',
    clear: 'Sin sombra',
    note: 'Es una ilustración: cambiar la sombra no cambia los permisos. El contenido no visible sigue oculto, incluso con none.',
  },
  'ru-RU': {
    title: 'Предпросмотр затенения защиты',
    description: 'Сравните отображение одних и тех же областей для текущего пользователя при разных стратегиях.',
    strategy: 'Стратегия затенения',
    areas: ['Без защиты', 'Защищено · редактирование', 'Защищено · только чтение', 'Защищено · просмотр запрещён'],
    shadow: 'С затенением',
    clear: 'Без затенения',
    note: 'Это иллюстрация: изменение затенения не меняет права. Недоступное содержимое остаётся скрытым даже при выборе none.',
  },
}

const strategies = ['always', 'non-editable', 'non-viewable', 'none'] as const
const areas = [
  { range: 'A1:B3', protected: false, canEdit: true, canView: true },
  { range: 'D1:E3', protected: true, canEdit: true, canView: true },
  { range: 'G1:H3', protected: true, canEdit: false, canView: true },
  { range: 'J1:K3', protected: true, canEdit: false, canView: false },
]

export function PermissionShadowDemo() {
  const text = labels[useLocale()]
  const [strategy, setStrategy] = useState<(typeof strategies)[number]>('non-editable')

  return (
    <section
      aria-label={text.title}
      className="not-prose border-border bg-card text-card-foreground my-6 space-y-4 rounded-xl border p-4 sm:p-5"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{text.title}</p>
        <p className="text-muted-foreground text-sm">{text.description}</p>
      </div>
      <div role="group" aria-label={text.strategy} className="flex flex-wrap gap-2">
        {strategies.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={strategy === value ? 'default' : 'outline'}
            aria-pressed={strategy === value}
            onClick={() => setStrategy(value)}
            className="font-mono text-xs"
          >
            {value}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite" aria-atomic="true">
        {areas.map((area, index) => {
          // Range protection keeps non-viewable areas masked under every strategy except none.
          const shadow =
            area.protected &&
            strategy !== 'none' &&
            (strategy === 'always' || !area.canView || (strategy === 'non-editable' && !area.canEdit))

          return (
            <div key={area.range} className="min-w-0 space-y-2">
              <p className="flex min-h-10 items-end text-xs leading-5 font-medium">{text.areas[index]}</p>
              <div className="border-border bg-background overflow-hidden rounded-md border">
                <div className="border-border bg-muted text-muted-foreground border-b px-2 py-1 text-center font-mono text-xs">
                  {area.range}
                </div>
                <div aria-hidden="true" className="relative grid grid-cols-2">
                  {Array.from({ length: 6 }, (_, cell) => (
                    <div
                      key={cell}
                      className="border-border text-muted-foreground flex h-9 items-center justify-center text-xs [&:nth-child(-n+4)]:border-b [&:nth-child(odd)]:border-r"
                    >
                      {area.canView ? (cell + 1) * 120 : <EyeOff className="size-3.5" />}
                    </div>
                  ))}
                  {shadow && (
                    <div
                      className="text-muted-foreground pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 5px, currentColor 5px 7px)',
                      }}
                    />
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-xs">{shadow ? text.shadow : text.clear}</p>
            </div>
          )
        })}
      </div>
      <div className="bg-muted overflow-x-auto rounded-md px-3 py-2 font-mono text-xs">
        protectedRangeShadow: '{strategy}'
      </div>
      <p className="text-muted-foreground text-xs leading-5">{text.note}</p>
    </section>
  )
}
