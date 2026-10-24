'use client'

import { useEffect, useRef } from 'react'
import type { Scene } from './hairline'
import { mountScene } from './scene-illustration-renderer'

interface ISceneIllustrationProps {
  scene: Scene
  label: string
  ready: boolean
}

export function SceneIllustration({ scene, label, ready }: ISceneIllustrationProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!ready || !stage) return

    HL.inject(document)
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true', focusable: 'false' }, stage)
    const figure = mountScene({ stage, svg, read: { textContent: 'rest' } }, scene)
    return figure.destroy
  }, [ready, scene])

  return (
    <div
      ref={stageRef}
      data-hairline={scene}
      role="img"
      aria-label={label}
      className="mx-auto my-1 aspect-5/4 w-[88%] max-w-72 [--hairline-plate:var(--color-white)] dark:[--hairline-plate:var(--color-neutral-900)] [&_.hi]:fill-[color-mix(in_oklab,var(--hairline-hi)_8%,var(--hairline-plate))]!"
    />
  )
}
