'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'

const labels: Record<string, string[]> = {
  'en-US': [
    'Heading collapse illustration',
    'Fold the nested heading, then fold and reopen its parent. The nested section stays folded.',
    'Document structure',
    'Headings organize text, tables, and images into sections.',
    'Shared editing',
    'Collapse state is saved with the document and shared with collaborators.',
    'Export and reuse',
    'A heading at the same level starts a new section and remains visible.',
  ],
  'zh-CN': [
    '标题折叠示意',
    '先折叠子标题，再折叠并展开父标题，子章节会保持折叠。',
    '文档结构',
    '标题将文字、表格和图片组织为章节。',
    '共同编辑',
    '折叠状态随文档保存，并与协作者共享。',
    '导出与复用',
    '同级标题开始新的章节，不受上一章节折叠的影响。',
  ],
  'zh-TW': [
    '標題摺疊示意',
    '先摺疊子標題，再摺疊並展開父標題，子章節會保持摺疊。',
    '文件結構',
    '標題將文字、表格和圖片組織為章節。',
    '共同編輯',
    '摺疊狀態隨文件儲存，並與協作者共用。',
    '匯出與重用',
    '同層級標題開始新的章節，不受上一章節摺疊的影響。',
  ],
  'ja-JP': [
    '見出しの折りたたみの模式図',
    '子の見出しを閉じてから、親を閉じて開き直してください。子の節は閉じたままです。',
    '文書の構造',
    '見出しはテキスト、表、画像を節にまとめます。',
    '共同編集',
    '折りたたみ状態は文書に保存され、共同編集者と共有されます。',
    'エクスポートと再利用',
    '同じレベルの見出しは新しい節の開始となり、表示されたままです。',
  ],
  'ko-KR': [
    '제목 접기 개념도',
    '하위 제목을 접은 다음 상위 제목을 접었다 펼쳐 보세요. 하위 섹션은 접힌 상태를 유지합니다.',
    '문서 구조',
    '제목은 텍스트, 표, 이미지를 섹션으로 구성합니다.',
    '공동 편집',
    '접기 상태는 문서에 저장되며 공동 편집자와 공유됩니다.',
    '내보내기와 재사용',
    '같은 수준의 제목은 새 섹션을 시작하므로 계속 표시됩니다.',
  ],
  'fr-FR': [
    'Schéma du repli des titres',
    'Repliez le sous-titre, puis repliez et rouvrez son parent. La sous-section reste repliée.',
    'Structure du document',
    'Les titres organisent le texte, les tableaux et les images en sections.',
    'Édition collaborative',
    'L’état de repli est enregistré dans le document et partagé avec les collaborateurs.',
    'Export et réutilisation',
    'Un titre de même niveau commence une nouvelle section et reste visible.',
  ],
  'es-ES': [
    'Esquema de títulos plegables',
    'Pliega el subtítulo y luego pliega y abre su título principal. La subsección sigue plegada.',
    'Estructura del documento',
    'Los títulos organizan texto, tablas e imágenes en secciones.',
    'Edición colaborativa',
    'El estado de plegado se guarda en el documento y se comparte con los colaboradores.',
    'Exportación y reutilización',
    'Un título del mismo nivel inicia otra sección y permanece visible.',
  ],
  'ru-RU': [
    'Схема сворачивания заголовков',
    'Сверните вложенный заголовок, затем сверните и раскройте родительский. Вложенный раздел останется свёрнутым.',
    'Структура документа',
    'Заголовки объединяют текст, таблицы и изображения в разделы.',
    'Совместное редактирование',
    'Состояние сворачивания сохраняется в документе и доступно всем соавторам.',
    'Экспорт и повторное использование',
    'Заголовок того же уровня начинает новый раздел и остаётся видимым.',
  ],
}

export function HeadingCollapseDemo() {
  const text = labels[useLocale()]
  const id = useId()
  const [parentCollapsed, setParentCollapsed] = useState(false)
  const [childCollapsed, setChildCollapsed] = useState(false)

  return (
    <figure className="not-prose my-6 space-y-4 rounded-lg border p-4 text-sm" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </figcaption>
      <div className="bg-background space-y-3 rounded-md border p-3 sm:p-5">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start text-start whitespace-normal"
          aria-expanded={!parentCollapsed}
          aria-controls={`${id}-parent`}
          onClick={() => setParentCollapsed((collapsed) => !collapsed)}
        >
          {parentCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          {text[2]}
        </Button>
        <div id={`${id}-parent`} hidden={parentCollapsed} className="ms-6 space-y-3 border-s ps-3">
          <p className="text-muted-foreground">{text[3]}</p>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start text-start whitespace-normal"
            aria-expanded={!childCollapsed}
            aria-controls={`${id}-child`}
            onClick={() => setChildCollapsed((collapsed) => !collapsed)}
          >
            {childCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            {text[4]}
          </Button>
          <p id={`${id}-child`} hidden={childCollapsed} className="text-muted-foreground ms-6">
            {text[5]}
          </p>
        </div>
        <div className="space-y-2 border-t ps-3 pt-4">
          <p className="font-medium">{text[6]}</p>
          <p className="text-muted-foreground">{text[7]}</p>
        </div>
      </div>
    </figure>
  )
}
