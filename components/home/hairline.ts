export type Point = [number, number]
export type Project = (x: number, y: number, z: number) => Point
export type Scene = 'sheets' | 'docs' | 'slides' | 'bases' | 'boards' | 'pdf'

interface IRingPoint {
  u: number
  v: number
  nu: number
  nv: number
}

interface ISolid {
  g: SVGGElement
  sil: SVGPathElement
  cr: SVGPathElement
}

type Camera = object

type Tween = object

export interface ISceneHost {
  stage: HTMLElement
  svg: SVGSVGElement
  read: { textContent: string | null }
}

export interface IHairlineKernel {
  Cam: (azimuth: number, elevation: number, scale: number) => Camera
  fit: (camera: Camera, points: [number, number, number][], x: number, y: number) => void
  proj: (camera: Camera) => Project
  facing: (camera: Camera) => (point: IRingPoint) => boolean
  rings: (x0: number, y0: number, x1: number, y1: number, radius: number, inset: number) => [IRingPoint[], IRingPoint[]]
  prism: (
    project: Project,
    front: (point: IRingPoint) => boolean,
    ring: IRingPoint[],
    inner: IRingPoint[],
    z0: number,
    z1: number,
  ) => { sil: string; crease: string }
  seg: (from: Point, to: Point) => string
  poly: (points: Point[]) => string
  fillet: (points: Point[], radii: number[]) => Point[]
  mk: <K extends keyof SVGElementTagNameMap>(
    tag: K,
    attributes: Record<string, string | number>,
    parent: Element,
  ) => SVGElementTagNameMap[K]
  solid: (parent: Element) => ISolid
  put: (solid: ISolid, paths: { sil: string; crease: string }) => void
  tween: (value: number) => Tween
  tset: (tween: Tween, target: number, now: number, delay: number) => void
  tval: (tween: Tween, now: number) => number
  tdone: (tween: Tween, now: number) => boolean
  register: (
    stage: HTMLElement,
    tick: (dt: number, now: number) => boolean,
  ) => { wake: () => void; unregister: () => void }
  pointer: (stage: HTMLElement, handlers: { move: (point: Point) => void; leave: () => void }) => () => void
  disposer: () => { add: (dispose: () => void) => void; dispose: () => void }
  inject: (root: Document) => void
}

declare global {
  const HL: IHairlineKernel
}
