// These are deterministic frontend fixtures, not a live delivery service.
export const ROUTES: Record<string, { status: string; stops: (string | number)[][] }> = {
  NORTH: {
    status: 'North route · 3 stops',
    stops: [
      ['Glasshouse', 12],
      ['Water tower', 0],
      ['Hill depot', 18],
    ],
  },
  EAST: {
    status: 'East route · 2 stops',
    stops: [
      ['Print studio', 7],
      ['Community kitchen', 22],
    ],
  },
  EMPTY: { status: 'No deliveries scheduled', stops: [] },
}

// Intentionally stricter than SUM: ignore blanks, accept numbers, reject text/booleans.
export function customSum(...arguments_: unknown[]): number | string {
  let total = 0
  for (const value of arguments_.flat(2)) {
    if (value === null || value === undefined || value === '') continue
    if (typeof value !== 'number') return '#VALUE!'
    total += value
  }
  return Number.isFinite(total) ? total : '#NUM!'
}

type Result = { data: (typeof ROUTES)[string]; error?: never } | { data?: never; error: string }
export function createLocalSource(changed: () => void) {
  const cache = new Map<string, Result>()
  const pending = new Map<string, Promise<Result>>()
  const cancel = new Map<string, () => void>()
  const events: { key: string; state: string }[] = []
  let disposed = false
  let requests = 0
  let cacheHits = 0
  const record = (key: string, state: string) => {
    events.push({ key, state })
    if (events.length > 8) events.shift()
    changed()
  }
  const lookup = (key: unknown): Promise<Result> => {
    if (disposed) return Promise.resolve({ error: '#N/A' })
    // Facade callbacks receive a cell reference as a one-cell matrix.
    if (Array.isArray(key) && key.length === 1 && Array.isArray(key[0]) && key[0].length === 1) key = key[0][0]
    if (typeof key !== 'string') return Promise.resolve({ error: '#VALUE!' })
    if (cache.has(key)) {
      cacheHits++
      record(key, 'cached')
      return Promise.resolve(cache.get(key)!)
    }
    if (pending.has(key)) return pending.get(key)!
    requests++
    record(key, 'loading')
    const promise = new Promise<Result>((resolve) => {
      const finish = (result: Result, state: string) => {
        clearTimeout(response)
        clearTimeout(deadline)
        pending.delete(key)
        cancel.delete(key)
        if (result.data) cache.set(key, result)
        record(key, state)
        resolve(result)
      }
      const response = setTimeout(
        () => {
          if (key === 'FAULT') finish({ error: '#VALUE!' }, 'simulated source failure')
          else if (!Object.hasOwn(ROUTES, key)) finish({ error: '#N/A' }, 'missing key')
          else finish({ data: ROUTES[key] }, 'loaded')
        },
        key === 'TIMEOUT' ? 1500 : 400,
      )
      const deadline = setTimeout(() => finish({ error: '#N/A' }, 'timeout after 800ms'), 800)
      cancel.set(key, () => finish({ error: '#N/A' }, 'canceled'))
    })
    pending.set(key, promise)
    return promise
  }
  return {
    lookup,
    clearCache: () => cache.clear(),
    snapshot: () => ({
      requests,
      cacheHits,
      pending: pending.size,
      cachedKeys: [...cache.keys()],
      events: [...events],
    }),
    dispose() {
      disposed = true
      for (const stop of cancel.values()) stop()
      cache.clear()
    },
  }
}
