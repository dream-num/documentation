import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSlidesPlugin } from '@univerjs/slides'
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui'
import SlidesUIEnUS from '@univerjs/slides-ui/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { SLIDE_DATA } from './data'

import './styles.css'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/slides-ui/lib/index.css'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      UIEnUS,
      DocsUIEnUS,
      SlidesUIEnUS,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)

univer.registerPlugin(UniverUIPlugin, {
  container: 'app',
})

univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)

univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverSlidesPlugin)
univer.registerPlugin(UniverSlidesUIPlugin)

univer.createUnit(UniverInstanceType.UNIVER_SLIDE, SLIDE_DATA)
