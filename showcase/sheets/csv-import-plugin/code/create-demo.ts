import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset, unmount } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import coreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { CellValueType, createUniver, LocaleType } from '@univerjs/presets'

import { parseCsv, readCsvFile } from './csv-plugin/utils'
import { CSV_SAMPLES, createFixture } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: Partial<IWorkbookData>,
) {
  const data = structuredClone(saved ?? createFixture())
  if (!data.id || !data.sheetOrder?.length || !data.sheetOrder.every((id) => data.sheets?.[id]?.id === id))
    throw new Error('Restore a workbook ID and every ordered worksheet.')
  const zh = locale === LocaleType.ZH_CN
  const t = (en: string, cn: string) => (zh ? cn : en)
  const root = document.createElement('div')
  root.className = 'csv-demo'
  root.dataset.ready = 'false'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML = `<section aria-label="${t('CSV import', 'CSV 导入')}">
    <details class="csv-controls"><summary>${t('CSV source and options', 'CSV 源文本与选项')}</summary><fieldset disabled>
      <label>${t('Sample', '案例')} <select aria-label="CSV sample"></select></label>
      <button type="button" data-action="sample">${t('Load sample', '加载案例')}</button>
      <button type="button" data-action="download">${t('Download sample', '下载案例')}</button>
      <label>${t('UTF-8 file', 'UTF-8 文件')}<input type="file" accept=".csv,.tsv,.txt" aria-label="CSV file"></label>
      <label>${t('Delimiter', '分隔符')} <select aria-label="Delimiter"><option value=",">${t('Comma', '逗号')}</option><option value=";">${t('Semicolon', '分号')}</option><option value="&#9;">${t('Tab', '制表符')}</option></select></label>
      <label><input type="checkbox" aria-label="Skip empty lines" checked>${t('Skip empty lines', '跳过空行')}</label>
      <label class="csv-source-label">${t('UTF-8 source text', 'UTF-8 源文本')}<textarea aria-label="CSV source" rows="3" spellcheck="false"></textarea></label>
      <button type="button" data-action="validate">${t('Validate text', '验证文本')}</button>
    </fieldset></details>
    <button type="button" data-action="import" disabled>${t('Import at selection', '导入到选区')}</button>
    <output role="status" aria-live="polite">${t('Loading editor…', '编辑器加载中…')}</output>
  </section><div class="csv-editor"></div>`
  container.append(root)
  const controls = root.querySelector<HTMLDetailsElement>('details')!
  const fieldset = root.querySelector<HTMLFieldSetElement>('fieldset')!
  const samples = root.querySelector<HTMLSelectElement>('[aria-label="CSV sample"]')!
  const chineseLabels = [
    '维修接件 · 引号 CSV',
    '零件台账 · 分号',
    '志愿者排班 · TSV',
    '字面量 · 不执行公式',
    '不等长记录与空行',
    '空输入 · 拒绝',
    '未闭合引号 · 拒绝',
  ]
  samples.replaceChildren(
    ...CSV_SAMPLES.map((sample, i) => new Option(zh ? chineseLabels[i] : sample.label, sample.id)),
  )
  const source = root.querySelector<HTMLTextAreaElement>('textarea')!
  const delimiter = root.querySelector<HTMLSelectElement>('[aria-label="Delimiter"]')!
  const skip = root.querySelector<HTMLInputElement>('[aria-label="Skip empty lines"]')!
  const fileInput = root.querySelector<HTMLInputElement>('[type="file"]')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const editor = root.querySelector<HTMLElement>('.csv-editor')!
  source.value = CSV_SAMPLES[0].text
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: coreEnUS, [LocaleType.ZH_CN]: coreZhCN },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false,
    busy = false,
    frame = 0
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  const listeners = new AbortController()
  const cleanup: Array<() => void> = []
  let timer: ReturnType<typeof setTimeout> | undefined
  function refresh() {
    if (disposed) return
    root.dataset.busy = String(busy)
    fieldset.disabled = root.dataset.ready !== 'true' || busy
    editor.inert = busy
    for (const actionId of ['validate', 'import'])
      root.querySelector<HTMLButtonElement>(`[data-action="${actionId}"]`)!.disabled =
        root.dataset.ready !== 'true' || busy || !source.value.length
    root.querySelector<HTMLButtonElement>('[data-action="download"]')!.disabled = !CSV_SAMPLES.find(
      (sample) => sample.id === samples.value,
    )!.text.length
  }
  function rejected(error: unknown) {
    status.textContent = t('Rejected: ', '已拒绝：') + (error instanceof Error ? error.message : String(error))
  }
  function importText(text: string, separator = ',', skipEmptyLines = true) {
    if (disposed || busy || root.dataset.ready !== 'true') throw new Error('Wait for the current editor and file read.')
    const rows = parseCsv(text, separator, skipEmptyLines)
    const sheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!
    const selections = sheet.getSelection()?.getActiveRangeList() ?? []
    if (selections.length !== 1) throw new Error(t('Select one contiguous target range.', '请选择一个连续目标区域。'))
    const row = selections[0].getRow(),
      column = selections[0].getColumn()
    if (
      row < 0 ||
      column < 0 ||
      row + rows.length > sheet.getMaxRows() ||
      column + rows[0].length > sheet.getMaxColumns()
    )
      throw new Error(
        t('The import rectangle must fit inside the current sheet.', '导入矩形必须位于当前工作表范围内。'),
      )
    const range = sheet.getRange(row, column, rows.length, rows[0].length)
    range.setValues(
      rows.map((record) => record.map((v) => ({ v, t: CellValueType.STRING, f: null, si: null, p: null }))),
    )
    if (JSON.stringify(range.getRawValues()) !== JSON.stringify(rows))
      throw new Error(
        t(
          'SDK readback differs from parsed text; use native Undo if needed.',
          'SDK 写入结果与解析文本不同；请按需使用原生撤销。',
        ),
      )
    range.activate()
    return range
  }
  function action(name: string) {
    if (disposed || busy || root.dataset.ready !== 'true') return
    try {
      const sample = CSV_SAMPLES.find((item) => item.id === samples.value)!
      if (name === 'sample') {
        source.value = sample.text
        delimiter.value = sample.delimiter
        status.textContent = t('Draft loaded; not imported.', '草稿已加载，尚未导入。')
      } else if (name === 'download') {
        const url = URL.createObjectURL(new Blob([sample.text], { type: 'text/plain;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = url
        link.download = sample.filename
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 0)
        status.textContent = t('Original sample downloaded.', '原始案例文件已下载。')
      } else if (name === 'validate') {
        const rows = parseCsv(source.value, delimiter.value, skip.checked)
        status.textContent = t('Valid: ', '验证通过：') + rows.length + ' × ' + rows[0].length
      } else if (name === 'import') {
        const range = importText(source.value, delimiter.value, skip.checked)
        status.textContent = t('Imported: ', '已导入：') + range.getA1Notation()
        controls.open = false
      }
    } catch (error) {
      rejected(error)
    }
    refresh()
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]'))
    button.addEventListener('click', () => action(button.dataset.action!), { signal: listeners.signal })
  for (const input of [source, delimiter, skip, samples])
    input.addEventListener('input', refresh, { signal: listeners.signal })
  fileInput.addEventListener(
    'cancel',
    () => {
      status.textContent = t('File selection canceled.', '已取消文件选择。')
    },
    { signal: listeners.signal },
  )
  fileInput.addEventListener(
    'change',
    async () => {
      const file = fileInput.files?.[0]
      fileInput.value = ''
      if (!file || disposed || busy) return
      busy = true
      status.textContent = t('Reading locally: ', '本地读取：') + file.name
      refresh()
      try {
        const text = await readCsvFile(file)
        if (disposed) return
        source.value = text
        if (/\.tsv$/i.test(file.name)) delimiter.value = '\t'
        status.textContent = t('Draft loaded; review and import.', '草稿已加载，请检查后导入。')
        controls.open = true
      } catch (error) {
        if (!disposed) rejected(error)
      } finally {
        busy = false
        refresh()
      }
    },
    { signal: listeners.signal },
  )
  const menu = univerAPI.createMenu({
    id: 'kestrel.open-csv',
    title: t('Open CSV', '打开 CSV'),
    tooltip: t('Choose a local UTF-8 CSV file', '选择本地 UTF-8 CSV 文件'),
    action: () => {
      if (!busy && !disposed && root.dataset.ready === 'true') fileInput.click()
    },
  })
  menu.appendTo('ribbon.start.others')
  cleanup.push(() => menu.dispose())
  function waitForCanvas() {
    if (disposed) return
    const canvas = editor.querySelector<HTMLCanvasElement>('canvas[id^="univer-sheet-main-canvas"]')
    if (!canvas?.width || !canvas.height || editor.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
      frame = requestAnimationFrame(waitForCanvas)
      return
    }
    if (!saved) {
      const sheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!
      sheet.getRange('B4').activate()
      sheet.scrollToCell(0, root.clientWidth < 600 ? 1 : 0, 0)
    }
    root.dataset.ready = 'true'
    status.textContent = ''
    clearTimeout(timer)
    refresh()
    finish()
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered) frame = requestAnimationFrame(waitForCanvas)
  })
  cleanup.push(() => lifecycle.dispose())
  function dispose() {
    if (disposed) return
    disposed = true
    listeners.abort()
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    finish()
    const errors: unknown[] = []
    for (const release of [
      ...cleanup.toReversed(),
      () => unmount(editor),
      () => univerAPI.disposeUnit(data.id!),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'CSV cleanup failed')
  }
  try {
    timer = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(frame)
      root.dataset.error = 'startup'
      status.textContent = t('CSV editor could not start. Reload to retry.', 'CSV 编辑器未能启动，请重新加载。')
      finish()
    }, 20000)
    univerAPI.createWorkbook(data)
    return {
      univerAPI,
      ready,
      importText,
      dispose,
      setDarkMode(enabled: boolean) {
        root.dataset.theme = enabled ? 'dark' : 'light'
        univerAPI.toggleDarkMode(enabled)
      },
    }
  } catch (error) {
    dispose()
    throw error
  }
}
