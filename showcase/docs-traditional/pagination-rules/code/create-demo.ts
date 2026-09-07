import { BooleanNumber, type IParagraphStyle } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { BASE_RULES, PARAGRAPHS, TITLE, VARIANTS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

// Preview and standalone both mount this complete UI, not just the editor.
export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'docs-feature'
  root.innerHTML =
    '<div class="docs-feature-controls"><label>Variant<select aria-label="Variant"></select></label><button type="button" data-command="inspect">Inspect</button><button type="button" data-command="undo">Undo</button><button type="button" data-command="redo">Redo</button><button type="button" data-command="reset">Reset</button></div><p role="alert" hidden></p><details open><summary>SDK readback · model values</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="docs-feature-editor"></div>'
  container.append(root)
  const select = root.querySelector('select')!
  for (const variant of VARIANTS) select.add(new Option(variant.label, variant.id))
  const edited = new Option('Custom / edited', 'edited')
  edited.disabled = true
  select.add(edited)
  const output = root.querySelector('output')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const events = new AbortController()
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(docsCoreEnUS) },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.docs-feature-editor')! }),
    ],
  })
  const dataStream = PARAGRAPHS.join('\r') + '\r\n'
  let offset = 0
  const seedParagraphs = PARAGRAPHS.map((text, index) => {
    offset += text.length + 1
    const paragraphStyle: IParagraphStyle = structuredClone({
      ...BASE_RULES,
      textStyle: { fs: 11, ff: 'Arial' },
      lineSpacing: 1.25,
      spaceBelow: { v: 12 },
    })
    if (index === 0) paragraphStyle.textStyle = { ...paragraphStyle.textStyle, fs: 18, bl: BooleanNumber.TRUE }
    return { startIndex: offset - 1, paragraphId: 'para_pagination-rules_' + index, paragraphStyle }
  })
  let doc = univerAPI.createDocument({
    id: 'pagination-rules-fixture',
    title: TITLE,
    body: {
      dataStream,
      paragraphs: seedParagraphs,
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'pagination-rules-section' }],
      textRuns: [],
    },
    documentStyle: {
      documentFlavor: univerAPI.Enum.DocumentFlavor.TRADITIONAL,
      pageSize: { width: 560, height: 480 },
      marginTop: 40,
      marginRight: 48,
      marginBottom: 40,
      marginLeft: 48,
    },
  })
  const baseline = structuredClone(doc.save())
  function targets() {
    const heading = doc.findParagraphByText('Follow-up actions')
    if (!heading) throw new Error('The marked heading was removed. Reset to restore the fixture.')
    const index = heading.getInfo().paragraphIndex
    const paragraphs = doc.getParagraphs().slice(index, index + 3)
    if (paragraphs.length !== 3) throw new Error('The marked section is incomplete. Reset to restore it.')
    return paragraphs
  }

  function readModel() {
    const paragraphs = targets()
    select.value =
      VARIANTS.find((variant) =>
        paragraphs.every((paragraph, index) => {
          const style = paragraph.getInfo().paragraph.paragraphStyle ?? {}
          return Object.entries(index === 0 ? variant.heading : variant.body).every(
            ([key, value]) => style[key as keyof IParagraphStyle] === value,
          )
        }),
      )?.id ?? 'edited'
    return {
      paragraphs: targets().map((paragraph) => ({
        text: paragraph.getText(),
        style: paragraph.getInfo().paragraph.paragraphStyle,
      })),
    }
  }
  function inspect() {
    output.textContent = JSON.stringify(readModel(), null, 2)
  }
  function applyVariant() {
    const variant = VARIANTS.find((item) => item.id === select.value)
    if (!variant) throw new Error('Unknown pagination variant.')
    const [heading, shortParagraph, longParagraph] = targets()
    // These are three SDK commands. Undo reverses one command, not the whole variant.
    for (const [paragraph, style] of [
      [heading, variant.heading],
      [shortParagraph, variant.body],
      [longParagraph, variant.body],
    ] as const) {
      if (!paragraph.setStyle(style)) throw new Error('A pagination rule was rejected. Inspect the model or Reset.')
    }
  }
  function run(action: () => void) {
    error.hidden = true
    try {
      action()
      inspect()
    } catch (cause) {
      error.textContent = cause instanceof Error ? cause.message : String(cause)
      error.hidden = false
    }
  }
  select.addEventListener('change', () => run(applyVariant), { signal: events.signal })
  root.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-command]')
      if (!button) return
      run(() => {
        const command = button.dataset.command
        if (command === 'reset') {
          univerAPI.disposeUnit(doc.getId())
          doc = univerAPI.createDocument(structuredClone(baseline))
          select.value = VARIANTS[0].id
        } else if (command === 'undo') {
          if (!doc.undo()) throw new Error('Nothing to undo.')
        } else if (command === 'redo') {
          if (!doc.redo()) throw new Error('Nothing to redo.')
        }
      })
    },
    { signal: events.signal },
  )
  inspect()
  return {
    dispose() {
      events.abort()
      univer.dispose()
      root.remove()
    },
  }
}
