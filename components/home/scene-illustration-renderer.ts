import type { ISceneHost, Point, Project, Scene } from './hairline'

interface IPart {
  x: number
  y: number
  width: number
  height: number
  z: number
  thickness?: number
  upright?: boolean
  marks?: (project: Project, z: number) => string
}

export function mountScene({ stage, svg, read }: ISceneHost, scene: Scene, reach = 22) {
  const {
    Cam,
    fit,
    proj,
    facing,
    rings,
    prism,
    seg,
    poly,
    fillet,
    mk,
    solid,
    put,
    tween,
    tset,
    tval,
    tdone,
    register,
    pointer,
    disposer,
  } = HL
  const bag = disposer()
  const camera = Cam(45, 0.5, 1.9)
  fit(
    camera,
    [
      [-10, -10, -8],
      [126, -10, 0],
      [-10, 112, 0],
      [126, 112, 0],
      [scene === 'bases' ? 0 : 56, scene === 'bases' ? 0 : 51, 80],
    ],
    200,
    145,
  )
  const project = proj(camera)
  const front = facing(camera)
  const root = mk('g', {}, svg)
  const parts: IPart[] = []
  let rest = 0

  function plate(x: number, y: number, width: number, height: number, bottom: number, top: number) {
    const [ring, inner] = rings(x, y, x + width, y + height, 4, 1)
    const element = solid(root)
    put(element, prism(project, front, ring, inner, bottom, top))
    return element
  }

  function lines(p: Project, z: number, x: number, y: number, widths: number[], gap = 9) {
    return widths.map((width, index) => seg(p(x, y + index * gap, z), p(x + width, y + index * gap, z))).join('')
  }

  switch (scene) {
    case 'sheets': {
      plate(-8, -15, 130, 109, -3, 0)
      mk(
        'path',
        { class: 'nf', d: seg(project(-8, 1, 0), project(122, 1, 0)) + lines(project, 0, 1, -7, [24], 0) },
        root,
      )
      for (let diagonal = 0; diagonal < 8; diagonal++) {
        for (let column = 0; column < 5; column++) {
          const row = diagonal - column
          if (row < 0 || row > 3) continue
          const x = column * 23
          const y = 7 + row * 20
          parts.push({
            x,
            y,
            width: 23,
            height: 20,
            z: column === 2 && row === 1 ? 2 : 0,
            thickness: 0.6,
            marks: (p, z) => lines(p, z, x + 5, y + 10, [8 + ((column + row) % 3) * 2], 0),
          })
          if (column === 2 && row === 1) rest = parts.length - 1
        }
      }
      break
    }
    case 'docs': {
      for (let index = 0; index < 3; index++) {
        const x = 14 + index * 4
        const y = 5 - index * 3
        parts.push({
          x,
          y,
          width: 74,
          height: 104,
          z: index * 9,
          thickness: 2,
          marks: (p, z) => lines(p, z, x + 11, y + 19, [35, 50, 47, 50, 33, 0, 50, 45, 28], 8),
        })
      }
      rest = 2
      break
    }
    case 'slides': {
      plate(-9, -2, 146, 105, -4, 0)
      for (let index = 0; index < 3; index++) {
        const y = 8 + index * 29
        parts.push({
          x: -1,
          y,
          width: 28,
          height: 18,
          z: index === 1 ? 3 : 1,
          thickness: 0.8,
          marks: (p, z) => lines(p, z, 4, y + 6, [17, 11], 5),
        })
      }
      parts.push({
        x: 36,
        y: 18,
        width: 94,
        height: 59,
        z: 7,
        thickness: 1.2,
        marks: (p, z) => {
          let path = lines(p, z, 46, 30, [53], 0) + lines(p, z, 46, 43, [24, 18, 22], 8)
          for (let bar = 0; bar < 3; bar++) {
            const left = 86 + bar * 12
            const top = 61 - bar * 8
            path += poly(
              fillet([p(left, top, z), p(left + 7, top, z), p(left + 7, 69, z), p(left, 69, z)], [1, 1, 1, 1]),
            )
          }
          return path
        },
      })
      rest = 3
      break
    }
    case 'bases': {
      plate(4, 2, 104, 95, -8, 1)
      plate(4, 2, 104, 7, 1, 16)
      for (let index = 0; index < 4; index++) {
        parts.push({
          x: 10,
          y: 14 + index * 19,
          width: 92,
          height: 52,
          z: 10 + (index === 1 ? 6 : 0),
          upright: true,
          thickness: 1.5,
          marks: (p, z) => lines(p, z, 21, 15, [56, 43, 53], 9) + lines(p, z, 21 + index * 15, 45, [11], 0),
        })
      }
      rest = 1
      break
    }
    case 'boards': {
      plate(-5, -5, 126, 104, -6, 0)
      const notes = [
        [4, 4, 41, 31, 3],
        [58, 8, 44, 30, 8],
        [17, 51, 36, 34, 6],
        [70, 55, 34, 28, 3],
      ]
      for (const [x, y, width, height, z] of notes) {
        parts.push({
          x,
          y,
          width,
          height,
          z,
          thickness: 1.5,
          marks: (p, top) => lines(p, top, x + 7, y + 10, [width - 14, width - 20], 7),
        })
      }
      rest = 1
      break
    }
    case 'pdf': {
      plate(5, -6, 94, 122, -5, 0)
      plate(12, 0, 80, 107, 0, 3)
      mk('path', { class: 'nf', d: lines(project, 3, 22, 18, [37, 56, 51, 56, 34, 0, 53, 49, 32], 9) }, root)
      plate(36, -8, 31, 15, 3, 7)
      for (let index = 0; index < 3; index++) {
        const y = 30 + index * 23
        parts.push({
          x: 64,
          y,
          width: 38,
          height: 17,
          z: 6 + index * 3,
          thickness: 1,
          marks: (p, z) => lines(p, z, 70, y + 8, [24], 0),
        })
      }
      const pen = plate(111, 14, 5, 63, 2, 7)
      pen.cr.classList.add('lo')
      mk('path', { class: 'sil', d: poly([project(111, 77, 7), project(116, 77, 7), project(113.5, 86, 4)]) }, root)
      rest = 1
      break
    }
  }

  const items = parts.map((part) => {
    const { x, y, width, height, z, upright } = part
    const p: Project = upright ? (u, v, h) => project(u, y + v * 0.18, h + v * 0.98) : project
    const y0 = upright ? 0 : y
    const [ring, inner] = rings(
      x,
      y0,
      x + width,
      y0 + height,
      scene === 'sheets' ? 0.6 : 2.6,
      scene === 'sheets' ? 0.25 : 0.8,
    )
    const element = solid(root)
    const marks = mk('path', { class: 'nf' }, element.g)
    return {
      part,
      p,
      ring,
      inner,
      element,
      marks,
      lift: tween(0),
      drawn: Number.NaN,
      center: p(x + width / 2, y0 + height / 2, z),
    }
  })
  if (scene === 'bases') plate(4, 91, 104, 7, 0, 18)

  function draw(index: number, lift: number) {
    const item = items[index]
    if (item.drawn === lift) return
    item.drawn = lift
    const { part, p, ring, inner, element, marks } = item
    const z = part.z + lift
    put(element, prism(p, front, ring, inner, z, z + (part.thickness ?? 3)))
    marks.setAttribute('d', part.marks?.(p, z + (part.thickness ?? 3)) ?? '')
  }

  items.forEach((item, index) => {
    draw(index, 0)
    item.element.sil.classList.toggle('hi', index === rest)
  })
  let active = -1
  const loop = register(stage, (_dt, now) => {
    let moving = false
    items.forEach((item, index) => {
      draw(index, tval(item.lift, now))
      if (!tdone(item.lift, now)) moving = true
    })
    return moving
  })
  bag.add(loop.unregister)

  function select(index: number, force = false) {
    if (active === index && !force) return
    const previous = active
    active = index
    const now = performance.now()
    const origin = items[index < 0 ? Math.max(0, previous) : index].center
    items.forEach((item, position) => {
      const distance = Math.hypot(item.center[0] - origin[0], item.center[1] - origin[1])
      const lift = index < 0 ? 0 : reach * (scene === 'sheets' ? 0.3 : 1) * Math.max(0, 1 - distance / 105)
      tset(item.lift, lift, now, Math.min(120, distance * 0.8))
      item.element.sil.classList.toggle('hi', position === (index < 0 ? rest : index))
    })
    read.textContent = index < 0 ? 'rest' : `${scene} ${index + 1}`
    stage.dataset.activePart = String(index)
    loop.wake()
  }

  function hit(point: Point) {
    let nearest = -1
    let distance = 75
    items.forEach((item, index) => {
      const next = Math.hypot(point[0] - item.center[0], point[1] - item.center[1])
      if (next < distance) {
        nearest = index
        distance = next
      }
    })
    select(nearest)
  }

  read.textContent = 'rest'
  stage.dataset.activePart = '-1'
  bag.add(pointer(stage, { move: hit, leave: () => select(-1) }))
  bag.add(() => {
    svg.replaceChildren()
    svg.remove()
    delete stage.dataset.activePart
  })
  return {
    set: (value: number) => {
      reach = value
      select(active, true)
    },
    destroy: bag.dispose,
  }
}
