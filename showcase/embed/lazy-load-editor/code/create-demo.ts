import type { IWorkbookData } from '@univerjs/core'

import type { createEditor } from './editor'
import { createRoutes, ROUTES, validateSnapshot } from './data'

import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale = 'enUS') {
  const root = document.createElement('div')
  root.className = 'lazy-load-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML = `<section class="lazy-overview">
    <h2>Cedar Community Logistics</h2><p>Weekly route planning · March 29, 2027</p>
    <table aria-label="Planning manifest"><thead><tr><th>Route</th><th>Hub</th><th>Runs / week</th></tr></thead><tbody>${ROUTES.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('')}</tbody></table>
    <div class="lazy-activation"><button type="button" data-action="load"></button><span role="status" class="lazy-status"></span></div>
    <p class="lazy-error" role="alert" hidden></p>
    <p class="lazy-scroll-hint">↓ Scroll to open the route editor</p>
  </section><section class="lazy-editor-target" aria-label="Deferred route editor">
    <div class="lazy-editor-controls"><button type="button" data-action="cancel">Cancel loading</button><button type="button" data-action="release">Release editor</button><button type="button" data-action="download">Download JSON</button></div>
    <p class="lazy-placeholder">The editor loads when this section is visible.</p><div class="lazy-mount"></div></section>`
  container.append(root)
  const target = root.querySelector<HTMLElement>('.lazy-editor-target')!
  const slot = root.querySelector<HTMLElement>('.lazy-mount')!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  const events = new AbortController()
  let editor: ReturnType<typeof createEditor> | undefined
  let phase: 'idle' | 'loading' | 'ready' | 'error' | 'releasing' = 'idle'
  let generation = 0
  let closed = false
  let error = ''
  let moduleLoadFailed = false
  let loading = Promise.resolve()
  let releasing = Promise.resolve()
  let url = ''
  function render() {
    if (closed) return
    root.dataset.ready = String(phase === 'ready')
    root.dataset.phase = phase
    root.querySelector('.lazy-status')!.textContent = {
      idle: 'Not loaded',
      loading: 'Loading…',
      ready: 'Ready',
      error: 'Loading failed',
      releasing: 'Releasing…',
    }[phase]
    root.querySelector<HTMLElement>('.lazy-placeholder')!.hidden = phase === 'ready'
    alert.hidden = !error
    alert.textContent = error
    for (const button of root.querySelectorAll<HTMLButtonElement>('button')) {
      const action = button.dataset.action
      button.disabled =
        phase === 'releasing' ||
        (action === 'load' && (moduleLoadFailed || !['idle', 'error'].includes(phase) || !!editor)) ||
        (action === 'cancel' && phase !== 'loading') ||
        (action === 'release' && !editor) ||
        (action === 'download' && phase !== 'ready')
      if (action === 'load')
        button.textContent = moduleLoadFailed
          ? 'Page refresh required'
          : phase === 'error'
            ? 'Retry editor load'
            : 'Open route editor'
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!closed && phase === 'idle' && entries.some((entry) => entry.isIntersecting)) void load().catch(() => {})
    },
    { root, threshold: 0.1 },
  )
  function load(data: Partial<IWorkbookData> = createRoutes('default')) {
    if (closed) return Promise.reject(new Error('The lazy editor host is disposed.'))
    if (moduleLoadFailed)
      return Promise.reject(
        new Error('The editor module failed to load. Save other page work before refreshing this page.'),
      )
    if (phase === 'loading') return loading
    if (phase === 'releasing') return Promise.reject(new Error('Wait for the current owner to finish releasing.'))
    if (editor) return Promise.reject(new Error('Release the current owner before loading another workbook.'))
    const snapshot = validateSnapshot(data)
    observer.disconnect()
    const ticket = ++generation
    phase = 'loading'
    error = ''
    render()
    loading = (async () => {
      let imported = false
      try {
        const deferred = await import('./editor')
        imported = true
        if (closed || ticket !== generation) return
        const owner = deferred.createEditor(slot, snapshot, darkMode, 'enUS')
        editor = owner
        await owner.ready
        if (closed || ticket !== generation) return
        phase = 'ready'
      } catch (cause) {
        if (closed || ticket !== generation) return
        error = cause instanceof Error ? cause.message : String(cause)
        if (!imported) {
          moduleLoadFailed = true
          error += ' Save other page work, then refresh this page to reload the editor module.'
        }
        if (editor) {
          try {
            await editor.dispose()
            editor = undefined
          } catch (cleanup) {
            error += ` Cleanup: ${String(cleanup)}`
          }
        }
        phase = 'error'
        root.scrollTop = 0
        throw cause
      } finally {
        render()
      }
    })()
    // User-facing errors are shown above; direct callers still receive the rejection.
    void loading.catch(() => {})
    return loading
  }
  function release() {
    if (phase === 'releasing') return releasing
    observer.disconnect()
    generation++
    phase = 'releasing'
    render()
    const owner = editor
    releasing = (async () => {
      try {
        await owner?.dispose()
        if (editor === owner) editor = undefined
        phase = 'idle'
        error = ''
        root.scrollTop = 0
      } catch (cause) {
        phase = 'error'
        error = String(cause)
        throw cause
      } finally {
        render()
      }
    })()
    void releasing.catch(() => {})
    return releasing
  }
  root.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
      if (!button || button.disabled) return
      const action = button.dataset.action
      if (action === 'load') {
        target.scrollIntoView({ block: 'start' })
        void load().catch(() => {})
      } else if (action === 'cancel' || action === 'release') void release().catch(() => {})
      else if (action === 'download' && editor) {
        if (url) URL.revokeObjectURL(url)
        url = URL.createObjectURL(
          new Blob([JSON.stringify(editor.univerAPI.getWorkbook('cedar-routes')!.save(), null, 2)], {
            type: 'application/json',
          }),
        )
        const link = document.createElement('a')
        link.href = url
        link.download = 'cedar-community-routes.json'
        link.click()
      }
    },
    { signal: events.signal },
  )
  render()
  observer.observe(target)
  return {
    get univerAPI() {
      return editor?.univerAPI
    },
    load,
    release,
    setDarkMode(value: boolean) {
      darkMode = value
      root.dataset.theme = value ? 'dark' : 'light'
      editor?.univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (closed) return releasing
      closed = true
      events.abort()
      observer.disconnect()
      if (url) URL.revokeObjectURL(url)
      releasing = release().finally(() => root.remove())
      return releasing
    },
  }
}
