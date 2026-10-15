'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const labels: Record<string, string[]> = {
  'en-US': [
    'One table, multiple views',
    'Change the Sheets course status, then switch views. Every view uses the same records.',
    'Grid',
    'Kanban',
    'Calendar',
    'Sheets course status',
    'Planned',
    'In progress',
    'Done',
    'Course',
    'Status',
    'Date',
    'Example learning schedule · September 2026',
    'Shared records',
  ],
  'zh-CN': [
    '同一张表，多种视图',
    '修改 Sheets 课程的状态，再切换视图。每个视图都使用同一组记录。',
    '网格',
    '看板',
    '日历',
    'Sheets 课程状态',
    '未开始',
    '进行中',
    '已完成',
    '课程',
    '状态',
    '日期',
    '示例学习计划 · 2026 年 9 月',
    '共享记录',
  ],
  'zh-TW': [
    '同一張表，多種檢視',
    '修改 Sheets 課程的狀態，再切換檢視。每個檢視都使用同一組記錄。',
    '網格',
    '看板',
    '行事曆',
    'Sheets 課程狀態',
    '未開始',
    '進行中',
    '已完成',
    '課程',
    '狀態',
    '日期',
    '範例學習計畫 · 2026 年 9 月',
    '共用記錄',
  ],
  'ja-JP': [
    '1 つのテーブル、複数のビュー',
    'Sheets コースの状態を変更してからビューを切り替えます。すべて同じレコードを使います。',
    'グリッド',
    'カンバン',
    'カレンダー',
    'Sheets コースの状態',
    '未着手',
    '進行中',
    '完了',
    'コース',
    '状態',
    '日付',
    '学習計画の例 · 2026 年 9 月',
    '共有レコード',
  ],
  'ko-KR': [
    '하나의 테이블, 여러 뷰',
    'Sheets 과정의 상태를 변경한 뒤 뷰를 전환하세요. 모든 뷰는 같은 기록을 사용합니다.',
    '그리드',
    '칸반',
    '캘린더',
    'Sheets 과정 상태',
    '예정',
    '진행 중',
    '완료',
    '과정',
    '상태',
    '날짜',
    '예시 학습 일정 · 2026년 9월',
    '공유 기록',
  ],
  'fr-FR': [
    'Une table, plusieurs vues',
    'Changez le statut du cours Sheets, puis changez de vue. Chaque vue utilise les mêmes enregistrements.',
    'Grille',
    'Kanban',
    'Calendrier',
    'Statut du cours Sheets',
    'Prévu',
    'En cours',
    'Terminé',
    'Cours',
    'Statut',
    'Date',
    'Exemple de parcours · Septembre 2026',
    'Enregistrements partagés',
  ],
  'es-ES': [
    'Una tabla, varias vistas',
    'Cambia el estado del curso Sheets y después la vista. Todas usan los mismos registros.',
    'Cuadrícula',
    'Kanban',
    'Calendario',
    'Estado del curso Sheets',
    'Pendiente',
    'En curso',
    'Completado',
    'Curso',
    'Estado',
    'Fecha',
    'Plan de estudio de ejemplo · Septiembre de 2026',
    'Registros compartidos',
  ],
  'ru-RU': [
    'Одна таблица, разные представления',
    'Измените статус курса Sheets и переключите представление. Все используют одни и те же записи.',
    'Сетка',
    'Канбан',
    'Календарь',
    'Статус курса Sheets',
    'Запланировано',
    'В процессе',
    'Готово',
    'Курс',
    'Статус',
    'Дата',
    'Пример учебного плана · Сентябрь 2026',
    'Общие записи',
  ],
}

export function ViewsDemo() {
  const text = labels[useLocale()]
  const [view, setView] = useState(0)
  const [records, setRecords] = useState([
    { title: 'Sheets', status: 0, day: 2 },
    { title: 'Docs', status: 1, day: 3 },
    { title: 'Slides', status: 2, day: 5 },
    { title: 'Bases', status: 1, day: 6 },
  ])
  const statuses = text.slice(6, 9)

  return (
    <section aria-label={text[0]} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </div>
      <div role="group" aria-label={text[0]} className="flex flex-wrap gap-2">
        {[0, 1, 2].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={value === view ? 'default' : 'outline'}
            aria-pressed={value === view}
            onClick={() => setView(value)}
          >
            {text[value + 2]}
          </Button>
        ))}
      </div>
      <label className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium">{text[5]}</span>
        <Select
          items={statuses.map((label, value) => ({ label, value }))}
          value={records[0].status}
          onValueChange={(status) => {
            if (status !== null)
              setRecords(records.map((record, index) => (index === 0 ? { ...record, status } : record)))
          }}
        >
          <SelectTrigger aria-label={text[5]}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status, index) => (
              <SelectItem key={status} value={index}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <p className="text-muted-foreground text-xs">{text[12]}</p>
      <div role="region" aria-label={text[view + 2]} className="bg-background overflow-x-auto rounded-md border">
        {view === 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                {text.slice(9, 12).map((label) => (
                  <th key={label} scope="col" className="px-3 py-2 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.title} className="border-t">
                  <td className="px-3 py-3 font-medium">{record.title}</td>
                  <td className="px-3 py-3">{statuses[record.status]}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <time dateTime={`2026-09-0${record.day}`}>09 / 0{record.day}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : view === 1 ? (
          <div className="grid min-w-[480px] grid-cols-3 gap-3 p-3">
            {statuses.map((status, index) => (
              <section key={status} aria-label={status} className="bg-muted min-h-44 space-y-2 rounded-md p-2">
                <p className="text-xs font-medium">{status}</p>
                {records
                  .filter((record) => record.status === index)
                  .map((record) => (
                    <article
                      key={record.title}
                      aria-label={record.title}
                      className="bg-card space-y-2 rounded border p-3"
                    >
                      <p className="font-medium">{record.title}</p>
                      <p className="text-muted-foreground text-xs">09 / 0{record.day}</p>
                    </article>
                  ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="grid min-w-[560px] grid-cols-7 divide-x">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <section key={day} aria-label={`09 / 0${day}`} className="min-h-44 space-y-3 p-2">
                <p className="text-muted-foreground text-xs">{day}</p>
                {records
                  .filter((record) => record.day === day)
                  .map((record) => (
                    <article
                      key={record.title}
                      aria-label={record.title}
                      className="border-primary/20 bg-primary/10 space-y-1 rounded border p-1.5"
                    >
                      <p className="text-xs font-medium">{record.title}</p>
                      <p className="text-muted-foreground text-xs wrap-break-word">{statuses[record.status]}</p>
                    </article>
                  ))}
              </section>
            ))}
          </div>
        )}
      </div>
      <p role="status" className="text-muted-foreground text-xs">
        {text[13]}: {records.length} · Sheets: {statuses[records[0].status]}
      </p>
    </section>
  )
}
