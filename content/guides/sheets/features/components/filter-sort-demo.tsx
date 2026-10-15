'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const labels: Record<string, string[]> = {
  'en-US': [
    'Filter and sort a learning plan',
    'Filter to focus on selected records, then sort by progress. Record IDs help you follow the same data.',
    'Only progress ≥ 70%',
    'Original order',
    'Progress ↑',
    'Progress ↓',
    'Record ID',
    'Course',
    'Progress',
    'Visible records',
    'Filtering hides records; sorting changes their order. Clear the filter to see every record again.',
  ],
  'zh-CN': [
    '筛选与排序学习计划',
    '先筛选关注的记录，再按学习进度排序。通过记录 ID 观察同一条数据的位置。',
    '只看进度 ≥ 70%',
    '原始顺序',
    '进度升序',
    '进度降序',
    '记录 ID',
    '课程',
    '学习进度',
    '可见记录',
    '筛选隐藏不符合条件的记录，排序改变记录顺序。取消筛选后仍能看到全部记录。',
  ],
  'zh-TW': [
    '篩選與排序學習計畫',
    '先篩選關注的記錄，再按學習進度排序。透過記錄 ID 觀察同一筆資料的位置。',
    '只看進度 ≥ 70%',
    '原始順序',
    '進度升冪',
    '進度降冪',
    '記錄 ID',
    '課程',
    '學習進度',
    '可見記錄',
    '篩選隱藏不符合條件的記錄，排序改變記錄順序。取消篩選後仍可看到全部記錄。',
  ],
  'ja-JP': [
    '学習計画のフィルターと並べ替え',
    '対象を絞り、進捗で並べ替えます。レコード ID で同じデータの位置を追えます。',
    '進捗 70% 以上のみ',
    '元の順序',
    '進捗の昇順',
    '進捗の降順',
    'レコード ID',
    'コース',
    '学習進捗',
    '表示件数',
    'フィルターは行を非表示にし、並べ替えは順序を変えます。フィルターを解除すると全件が再表示されます。',
  ],
  'ko-KR': [
    '학습 계획 필터 및 정렬',
    '원하는 기록을 필터링하고 진도순으로 정렬하세요. 기록 ID로 같은 데이터의 위치를 확인할 수 있습니다.',
    '진도 70% 이상만',
    '원래 순서',
    '진도 오름차순',
    '진도 내림차순',
    '기록 ID',
    '과정',
    '학습 진도',
    '표시 기록',
    '필터는 기록을 숨기고 정렬은 순서를 바꿉니다. 필터를 해제하면 모든 기록이 다시 표시됩니다.',
  ],
  'fr-FR': [
    'Filtrer et trier un parcours',
    'Filtrez les cours, puis triez leur progression. Les identifiants permettent de suivre chaque enregistrement.',
    'Progression ≥ 70 % seulement',
    'Ordre initial',
    'Progression ↑',
    'Progression ↓',
    'Identifiant',
    'Cours',
    'Progression',
    'Enregistrements visibles',
    'Le filtre masque des enregistrements ; le tri change leur ordre. Retirez le filtre pour tous les retrouver.',
  ],
  'es-ES': [
    'Filtrar y ordenar un plan de estudio',
    'Filtra los cursos y ordénalos por progreso. Sigue cada registro mediante su ID.',
    'Solo progreso ≥ 70 %',
    'Orden original',
    'Progreso ↑',
    'Progreso ↓',
    'ID del registro',
    'Curso',
    'Progreso',
    'Registros visibles',
    'El filtro oculta registros; la ordenación cambia su posición. Quita el filtro para verlos todos.',
  ],
  'ru-RU': [
    'Фильтр и сортировка учебного плана',
    'Отберите курсы и отсортируйте их по прогрессу. Идентификатор помогает найти ту же запись.',
    'Только прогресс ≥ 70%',
    'Исходный порядок',
    'Прогресс ↑',
    'Прогресс ↓',
    'ID записи',
    'Курс',
    'Прогресс',
    'Видимые записи',
    'Фильтр скрывает записи, а сортировка меняет порядок. Снимите фильтр, чтобы снова увидеть все записи.',
  ],
}
const records = [
  { id: 1, course: 'Sheets', progress: 86 },
  { id: 2, course: 'Docs', progress: 100 },
  { id: 3, course: 'Slides', progress: 64 },
  { id: 4, course: 'Bases', progress: 92 },
  { id: 5, course: 'Boards', progress: 48 },
  { id: 6, course: 'PDFs', progress: 78 },
]

export function FilterSortDemo() {
  const text = labels[useLocale()]
  const [filtered, setFiltered] = useState(false)
  const [sort, setSort] = useState(0)
  const visible = records
    .filter((record) => !filtered || record.progress >= 70)
    .toSorted((a, b) => (sort === 0 ? a.id - b.id : sort === 1 ? a.progress - b.progress : b.progress - a.progress))

  return (
    <section aria-label={text[0]} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={filtered} onCheckedChange={setFiltered} />
        {text[2]}
      </label>
      <div role="group" aria-label={text[0]} className="flex flex-wrap gap-2">
        {[0, 1, 2].map((order) => (
          <Button
            key={order}
            size="sm"
            variant={sort === order ? 'default' : 'outline'}
            aria-pressed={sort === order}
            onClick={() => setSort(order)}
          >
            {text[order + 3]}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted">
            <tr>
              {text.slice(6, 9).map((label) => (
                <th key={label} scope="col" className="px-3 py-2 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="px-3 py-2 font-mono">{record.id}</td>
                <td className="px-3 py-2">{record.course}</td>
                <td className="min-w-28 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div className="bg-primary h-full" style={{ width: `${record.progress}%` }} />
                    </div>
                    <span className="w-9 text-right tabular-nums">{record.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status" className="font-medium">
        {text[9]}: {visible.length} / {records.length}
      </p>
      <p className="text-muted-foreground text-xs leading-5">{text[10]}</p>
    </section>
  )
}
