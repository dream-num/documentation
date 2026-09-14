'use client'

import { useLocale } from 'next-intl'
import { useEffect, useId, useState } from 'react'

import { Button } from '@/components/ui/button'

const labels: Record<string, string[]> = {
  'en-US': [
    'Plugin lifecycle',
    'Play',
    'Pause',
    'Next',
    'Reset',
    'Load B at',
    'Global',
    'Plugin',
    'Not loaded',
    'Load',
    'Catch-up · global stage unchanged',
    'Slowed down to show synchronous hook calls.',
  ],
  'zh-CN': [
    '插件生命周期',
    '播放',
    '暂停',
    '下一步',
    '重置',
    'B 的加载阶段',
    '全局',
    '插件',
    '未加载',
    '加载',
    '补执行 · 全局阶段不变',
    '为展示同步钩子的调用顺序，演示已放慢。',
  ],
  'zh-TW': [
    '外掛生命週期',
    '播放',
    '暫停',
    '下一步',
    '重設',
    'B 的載入階段',
    '全域',
    '外掛',
    '未載入',
    '載入',
    '補執行 · 全域階段不變',
    '為呈現同步鉤子的呼叫順序，示範已放慢。',
  ],
  'ja-JP': [
    'プラグインのライフサイクル',
    '再生',
    '一時停止',
    '次へ',
    'リセット',
    'B の読み込み段階',
    'グローバル',
    'プラグイン',
    '未読込',
    '読込',
    '追いつき処理 · グローバル段階は不変',
    '同期フックの順序を示すため、ゆっくり再生します。',
  ],
  'ko-KR': [
    '플러그인 수명 주기',
    '재생',
    '일시 정지',
    '다음',
    '초기화',
    'B 로드 단계',
    '전역',
    '플러그인',
    '로드 전',
    '로드',
    '따라잡기 · 전역 단계 유지',
    '동기 훅 호출 순서를 보여 주기 위해 느리게 재생합니다.',
  ],
  'fr-FR': [
    'Cycle des plugins',
    'Lire',
    'Pause',
    'Suivant',
    'Réinitialiser',
    'Charger B à',
    'Global',
    'Plugin',
    'Non chargé',
    'Charger',
    'Rattrapage · étape globale inchangée',
    'Lecture ralentie pour montrer les appels synchrones.',
  ],
  'es-ES': [
    'Ciclo de plugins',
    'Reproducir',
    'Pausa',
    'Siguiente',
    'Reiniciar',
    'Cargar B en',
    'Global',
    'Plugin',
    'Sin cargar',
    'Cargar',
    'Puesta al día · etapa global sin cambios',
    'Reproducción lenta para mostrar las llamadas síncronas.',
  ],
  'ru-RU': [
    'Цикл плагинов',
    'Пуск',
    'Пауза',
    'Далее',
    'Сброс',
    'Загрузить B на',
    'Глобально',
    'Плагин',
    'Не загружен',
    'Загрузка',
    'Навёрстывание · глобальный этап прежний',
    'Синхронные вызовы показаны в замедленном темпе.',
  ],
}
const stages = ['Starting', 'Ready', 'Rendered', 'Steady']

export function LifecycleDemo() {
  const [title, play, pause, next, reset, loadAt, global, plugin, unloaded, load, catchUp, note] = labels[useLocale()]
  const id = useId()
  const [arrival, setArrival] = useState(2)
  const [playback, setPlayback] = useState({ cursor: 0, playing: false })

  const createFrames = () => {
    let state = {
      global: 0,
      a: -1,
      b: -1,
      loadedA: false,
      loadedB: false,
      target: 'global',
      catchingUp: false,
      action: `${global}: Starting`,
    }
    const frames = [{ ...state }]
    const record = (change: Partial<typeof state>) => {
      state = { ...state, catchingUp: false, ...change }
      frames.push(state)
    }
    record({ loadedA: true, target: 'a', action: `${load} A` })
    record({ a: 0, action: 'A.onStarting()' })
    for (let stage = 1; stage < stages.length; stage++) {
      record({ global: stage, target: 'global', action: `${global}: ${stages[stage]}` })
      record({ a: stage, target: 'a', action: `A.on${stages[stage]}()` })
      if (stage === arrival) {
        record({ loadedB: true, target: 'b', action: `${load} B` })
        for (let hook = 0; hook <= stage; hook++) {
          record({ b: hook, target: 'b', catchingUp: true, action: `B.on${stages[hook]}()` })
        }
      } else if (stage > arrival) {
        record({ b: stage, target: 'b', action: `B.on${stages[stage]}()` })
      }
    }
    return frames
  }
  const frames = createFrames()
  const last = frames.length - 1
  const frame = frames[playback.cursor]
  const position = (index: number) => 120 + (index / last) * 740
  const globalEvents = frames.map((item, index) => ({ ...item, index })).filter((item) => item.target === 'global')

  useEffect(() => {
    if (!playback.playing) return
    const timer = window.setTimeout(() => {
      setPlayback((current) => ({ cursor: Math.min(current.cursor + 1, last), playing: current.cursor + 1 < last }))
    }, 850)
    return () => window.clearTimeout(timer)
  }, [playback, last])

  return (
    <section aria-label={title} className="not-prose bg-background my-6 overflow-hidden rounded-lg border text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <span className="text-muted-foreground">
          {loadAt} · {stages[arrival]}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              setPlayback({ cursor: playback.cursor === last ? 0 : playback.cursor, playing: !playback.playing })
            }
          >
            {playback.playing ? pause : play}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={playback.cursor === last}
            onClick={() => setPlayback({ cursor: playback.cursor + 1, playing: false })}
          >
            {next}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPlayback({ cursor: 0, playing: false })}>
            {reset}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <svg role="group" aria-label={title} viewBox="0 0 900 280" className="w-full min-w-150">
          <defs>
            <marker id={`${id}-arrow`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="currentColor" />
            </marker>
          </defs>
          {globalEvents.map((event, index) => {
            const x = position(event.index) - 20
            const end = index + 1 < globalEvents.length ? position(globalEvents[index + 1].index) - 20 : 888
            const current = frame.global === event.global
            return (
              <g key={event.index} data-lane={index === 0 ? 'global' : undefined} data-stage={frame.global}>
                <rect
                  x={x}
                  y="20"
                  width={end - x}
                  height="225"
                  fill="currentColor"
                  className={current ? 'text-primary/10' : 'text-muted/30'}
                />
                <rect
                  x={x}
                  y="20"
                  width={end - x}
                  height="36"
                  fill="currentColor"
                  className={current ? 'text-primary' : 'text-muted'}
                />
                {event.global === 0 ? (
                  <text
                    x={(x + end) / 2}
                    y="43"
                    textAnchor="middle"
                    fontSize="12"
                    className={current ? 'fill-primary-foreground' : 'fill-muted-foreground'}
                  >
                    {stages[event.global]}
                  </text>
                ) : (
                  <foreignObject x={x} y="20" width={end - x} height="36">
                    <button
                      type="button"
                      aria-label={`${loadAt}: ${stages[event.global]}`}
                      aria-pressed={arrival === event.global}
                      title={`${loadAt}: ${stages[event.global]}`}
                      className={`h-full w-full cursor-pointer text-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current ${current ? 'text-primary-foreground' : 'text-muted-foreground'} ${arrival === event.global ? 'font-semibold underline' : ''}`}
                      onClick={() => {
                        setArrival(event.global)
                        setPlayback({ cursor: 0, playing: false })
                      }}
                    >
                      {stages[event.global]}
                    </button>
                  </foreignObject>
                )}
                <line
                  x1={x}
                  x2={x}
                  y1="58"
                  y2="245"
                  stroke="currentColor"
                  strokeDasharray="3 5"
                  className="text-border"
                />
              </g>
            )
          })}
          <text x="4" y="43" fontSize="14" className="fill-foreground font-medium">
            {global}
          </text>
          {(['a', 'b'] as const).map((lane, laneIndex) => {
            const y = 120 + laneIndex * 90
            const loaded = lane === 'a' ? frame.loadedA : frame.loadedB
            return (
              <g key={lane} data-lane={lane} data-stage={frame[lane]}>
                <text x="4" y={y + 4} fontSize="14" className="fill-foreground font-medium">
                  {plugin} {lane.toUpperCase()}
                </text>
                {!loaded && (
                  <text x="4" y={y + 22} fontSize="12" className="fill-muted-foreground">
                    {unloaded}
                  </text>
                )}
                <line x1="100" x2="888" y1={y} y2={y} stroke="currentColor" className="text-border" />
                {frames.map((event, index) => {
                  if (event.target !== lane) return null
                  const x = position(index)
                  const reached = index <= playback.cursor
                  const active = index === playback.cursor
                  const isLoad = !event.action.includes('.on')
                  return (
                    <g
                      key={event.action}
                      opacity={reached ? 1 : 0.22}
                      className="transition-opacity duration-300 motion-reduce:transition-none"
                    >
                      {active && !isLoad && (
                        <path
                          d={`M${x},62 V${y - 12}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          markerEnd={`url(#${id}-arrow)`}
                          className="text-primary"
                        />
                      )}
                      {isLoad ? (
                        <path
                          d={`M${x},${y - 5} l5,5 l-5,5 l-5,-5 Z`}
                          fill="currentColor"
                          className="text-muted-foreground"
                        />
                      ) : (
                        <circle cx={x} cy={y} r={active ? 7 : 5} fill="currentColor" className="text-primary" />
                      )}
                      <text
                        x={x}
                        y={y + (isLoad ? -16 : 24)}
                        textAnchor="middle"
                        fontSize="12"
                        className={active ? 'fill-primary font-semibold' : 'fill-foreground'}
                      >
                        {isLoad ? load : stages[event[lane]]}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
          <g
            style={{ transform: `translateX(${position(playback.cursor)}px)` }}
            className="transition-transform duration-300 ease-out motion-reduce:transition-none"
            data-playhead="true"
          >
            <path d="M-4,7 L4,7 L0,14 Z" fill="currentColor" className="text-primary" />
            <line
              x1="0"
              x2="0"
              y1="58"
              y2="247"
              stroke="currentColor"
              strokeDasharray="2 4"
              className="text-primary/40"
            />
          </g>
          <path
            d="M100,267 H888 l-5,-3 m5,3 l-5,3"
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground"
          />
        </svg>
      </div>
      <div className="bg-muted/30 border-t px-4 py-3">
        <div role="status" aria-live="polite" className="flex min-h-12 flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm">{frame.action}</span>
          <span className="text-muted-foreground text-xs">
            {global}: {stages[frame.global]} ·{' '}
            {frame.catchingUp ? catchUp : `${playback.cursor + 1} / ${frames.length}`}
          </span>
        </div>
        <p className="text-muted-foreground m-0 text-xs">{note}</p>
      </div>
    </section>
  )
}
