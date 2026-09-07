import type { ISlideData } from '@univerjs-pro/slides'
import { applyTextToShapeText } from '@univerjs-pro/engine-shape'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import ShapeEditorUIZhCN from '@univerjs-pro/shape-editor-ui/locale/zh-CN'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import SlidesUIZhCN from '@univerjs-pro/slides-ui/locale/zh-CN'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { LAUNCH_METRICS, PRODUCT_LAUNCH_DATA, PRODUCT_LAUNCH_MEDIA_DATA, PRODUCT_LAUNCH_STARTER_DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/slides/facade'
import '@univerjs/ui/facade'

export async function readLocalImage(file: File) {
  if (!(file instanceof File)) throw new Error('Choose a local PNG or JPEG file.')
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Choose a PNG or JPEG image.')
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Choose a non-empty image of at most 5 MiB.')
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const signature = file.type === 'image/png' ? [137, 80, 78, 71, 13, 10, 26, 10] : [255, 216, 255]
  if (!signature.every((byte, index) => header[index] === byte))
    throw new Error('Image contents do not match the PNG/JPEG file type.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('The image cannot be decoded. Choose another PNG or JPEG.')
  }
  const { width, height } = bitmap
  bitmap.close()
  if (width > 4096 || height > 4096) throw new Error('Image dimensions must not exceed 4096 × 4096 pixels.')
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)), { once: true })
    reader.addEventListener('error', () => reject(new Error('The local image could not be read.')), { once: true })
    reader.readAsDataURL(file)
  })
  return { source, width, height }
}

export function createDemo(container: HTMLElement, darkMode = false, saved?: ISlideData) {
  if (
    saved &&
    (!saved.id ||
      !Array.isArray(saved.slideOrder) ||
      new Set(saved.slideOrder).size !== saved.slideOrder.length ||
      !saved.slides ||
      saved.slideOrder.some((id) => {
        const page = saved.slides[id]
        return (
          page?.id !== id ||
          !Array.isArray(page.elementOrder) ||
          page.elementOrder.some((key) => page.elements?.[key]?.id !== key)
        )
      }) ||
      (saved.slideOrder.length > 0 &&
        Boolean(saved.activeSlideId) &&
        !saved.slideOrder.includes(saved.activeSlideId!)) ||
      !Number.isFinite(saved.defaultPageSize?.width) ||
      !Number.isFinite(saved.defaultPageSize?.height) ||
      saved.defaultPageSize.width <= 0 ||
      saved.defaultPageSize.height <= 0)
  )
    throw new Error('A complete presentation with valid page IDs and dimensions is required.')
  const root = document.createElement('div')
  root.className = 'product-launch'
  root.dataset.ready = 'false'
  container.append(root)
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, ShapeEditorUIEnUS, SlidesUIEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DesignZhCN, UIZhCN, DocsUIZhCN, ShapeEditorUIZhCN, SlidesUIZhCN),
    },
  })
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, { container: root, header: true, toolbar: true, ribbonType: 'grid' })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  univer.registerPlugin(UniverDrawingPlugin)
  univer.registerPlugin(UniverLicensePlugin)
  univer.registerPlugin(UniverSlidesPlugin)
  univer.registerPlugin(UniverSlidesUIPlugin)
  const api = FUniver.newAPI(univer)
  let disposed = false
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === api.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  const controller = {
    univerAPI: api,
    container,
    createDemo,
    readLocalImage,
    applyTextToShapeText,
    templates: {
      launch: structuredClone(PRODUCT_LAUNCH_DATA),
      starter: structuredClone(PRODUCT_LAUNCH_STARTER_DATA),
      media: structuredClone(PRODUCT_LAUNCH_MEDIA_DATA),
    },
    metrics: structuredClone(LAUNCH_METRICS),
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      if (owner.atlasLaunch === controller) delete owner.atlasLaunch
      univer.dispose()
      root.remove()
    },
  }
  const owner = window as typeof window & { univerAPI?: typeof api; atlasLaunch?: typeof controller }
  owner.univerAPI = api
  owner.atlasLaunch = controller
  try {
    api.createPresentation(structuredClone(saved ?? PRODUCT_LAUNCH_DATA))
    if (api.getCurrentLifecycleStage() >= api.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  } catch (cause) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent =
      (locale === LocaleType.ZH_CN ? '演示文稿启动失败：' : 'Presentation startup failed: ') +
      (cause instanceof Error ? cause.message : String(cause))
    root.append(alert)
    console.error(cause)
  }
  return controller
}
