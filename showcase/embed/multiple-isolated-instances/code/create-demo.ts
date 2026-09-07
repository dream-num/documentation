import { createRegion } from './region'

import './styles.css'

declare global {
  interface Window {
    regionalDemo?: ReturnType<typeof createRegion>
  }
}

export function createDemo(container: HTMLElement) {
  const location = new URL(window.location.href)
  const region = location.searchParams.get('isolatedRegion')
  if (region === 'north' || region === 'south') {
    const child = createRegion(container, region)
    window.regionalDemo = child
    return {
      async dispose() {
        if (window.regionalDemo === child) delete window.regionalDemo
        // Leave the child's React commit before unmounting the SDK's React root.
        // The parent calls regionalDemo directly before removing this iframe.
        await Promise.resolve()
        await child.dispose()
      },
    }
  }
  if (region) throw new Error('Unknown isolated region')
  const root = document.createElement('div')
  root.className = 'isolated-grid'
  const frames = ['north', 'south'].map((side) => {
    const frame = document.createElement('iframe')
    frame.title = `${side === 'north' ? 'North' : 'South'} maintenance budget`
    frame.dataset.region = side
    const url = new URL(location)
    url.searchParams.set('isolatedRegion', side)
    frame.src = url.href
    root.append(frame)
    return frame
  })
  container.append(root)
  let disposal: Promise<void> | undefined
  return {
    dispose() {
      return (disposal ??= Promise.allSettled(
        frames.map(async (frame) => frame.contentWindow?.regionalDemo?.dispose()),
      ).then((results) => {
        root.remove()
        const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason)
        if (failures.length) throw new AggregateError(failures, 'Regional owner cleanup failed')
      }))
    },
  }
}
