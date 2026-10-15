'use client'

import type { INumfmtLocaleTag } from '@univerjs/core'
import { getPatternPreview } from '@univerjs/sheets-numfmt'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const labels: Record<string, string[]> = {
  'en-US': [
    'Number format explorer',
    'Change the value, format, or locale. Formatting changes the display, not the stored number.',
    'Stored value',
    'Format pattern',
    'Format locale',
    'Displayed value',
    'Enter a finite number.',
    'Try 0.25 as a percentage, or 45658 as a date.',
  ],
  'zh-CN': [
    '数字格式示意',
    '修改数值、格式或地区。格式只改变显示，不改变存储的数值。',
    '存储数值',
    '格式代码',
    '格式地区',
    '显示结果',
    '请输入有效的有限数值。',
    '试试把 0.25 显示为百分比，或把 45658 显示为日期。',
  ],
  'zh-TW': [
    '數字格式示意',
    '修改數值、格式或地區。格式只改變顯示，不改變儲存的數值。',
    '儲存數值',
    '格式代碼',
    '格式地區',
    '顯示結果',
    '請輸入有效的有限數值。',
    '試試將 0.25 顯示為百分比，或將 45658 顯示為日期。',
  ],
  'ja-JP': [
    '数値書式のプレビュー',
    '数値、書式、地域を変更します。表示が変わっても保存される数値は同じです。',
    '保存される数値',
    '書式コード',
    '書式の地域',
    '表示結果',
    '有限の数値を入力してください。',
    '0.25 をパーセントで、45658 を日付で表示してみましょう。',
  ],
  'ko-KR': [
    '숫자 형식 미리보기',
    '값, 형식, 지역을 바꿔 보세요. 표시 형식은 저장된 숫자를 변경하지 않습니다.',
    '저장 값',
    '형식 코드',
    '형식 지역',
    '표시 결과',
    '유효한 유한 숫자를 입력하세요.',
    '0.25를 백분율로, 45658을 날짜로 표시해 보세요.',
  ],
  'fr-FR': [
    'Explorer les formats numériques',
    'Changez le nombre, le format ou la région. La valeur stockée reste la même.',
    'Valeur stockée',
    'Code de format',
    'Région du format',
    'Valeur affichée',
    'Saisissez un nombre fini.',
    'Essayez 0.25 en pourcentage, ou 45658 en date.',
  ],
  'es-ES': [
    'Explorar formatos numéricos',
    'Cambia el valor, el formato o la región. El número almacenado no cambia.',
    'Valor almacenado',
    'Código de formato',
    'Región del formato',
    'Valor mostrado',
    'Introduce un número finito.',
    'Prueba 0.25 como porcentaje o 45658 como fecha.',
  ],
  'ru-RU': [
    'Форматы чисел',
    'Измените число, формат или регион. Исходное число при этом не меняется.',
    'Исходное число',
    'Код формата',
    'Регион формата',
    'Отображение',
    'Введите конечное число.',
    'Попробуйте 0.25 в процентах или 45658 как дату.',
  ],
}

export function NumberFormatDemo() {
  const text = labels[useLocale()]
  const [value, setValue] = useState('1234.567')
  const [pattern, setPattern] = useState('#,##0.00')
  const [locale, setLocale] = useState<INumfmtLocaleTag>('en')
  const valid = value.trim() !== '' && Number.isFinite(Number(value))
  const preview = valid ? getPatternPreview(pattern, Number(value), locale).result : '—'

  return (
    <section aria-label={text[0]} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium">{text[2]}</span>
          <Input
            type="number"
            step="any"
            value={value}
            aria-invalid={!valid}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium">{text[3]}</span>
          <Select
            value={pattern}
            onValueChange={(format) => {
              if (format !== null) setPattern(format)
            }}
          >
            <SelectTrigger aria-label={text[3]} className="w-full font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['General', '#,##0.00', '0.00%', '$#,##0.00', 'yyyy-mm-dd'].map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium">{text[4]}</span>
          <Select<INumfmtLocaleTag>
            items={[
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
              { value: 'zh-CN', label: '简体中文' },
            ]}
            value={locale}
            onValueChange={(region) => {
              if (region !== null) setLocale(region)
            }}
          >
            <SelectTrigger aria-label={text[4]} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="zh-CN">简体中文</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div role="status" className="bg-background space-y-2 rounded-md border p-4">
        <p className="text-muted-foreground text-xs">{text[5]}</p>
        <p className="overflow-x-auto font-mono text-2xl tabular-nums">{preview}</p>
        <p className="text-muted-foreground text-xs">{valid ? `${text[2]}: ${value}` : text[6]}</p>
      </div>
      <p className="text-muted-foreground text-xs leading-5">{text[7]}</p>
    </section>
  )
}
