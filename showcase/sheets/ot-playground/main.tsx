import { IAuthzIoService, IMentionIOService, Injector, IUndoRedoService, LocaleType, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { greenTheme } from '@univerjs/design'
import { DesktopLocalFileService, DesktopMessageService, ILocalFileService, IMessageService, IUIPartsService, RediContext, UIPartsService } from '@univerjs/ui'
import { createRoot } from 'react-dom/client'
import { Mosaic, MosaicWindow } from 'react-mosaic-component'
import { isE2E, record, type, unit, url } from './consts'
import { CollabTestController } from './controllers/collab-test.controller'
import { enUS, zhCN } from './locales'
import { registerBasicPlugins, registerCollaborationFeatures, registerRecordFeatures, registerRichFeatures, registerSheetPlugins } from './plugins'
import { CollaborationControlPanel } from './views/collab-control-panel/CollabControlPanel'

import 'react-mosaic-component/react-mosaic-component.css'

import '../global.css'

const host = window.location.host
const isSecure = window.location.protocol === 'https:'
const httpProtocol = isSecure ? 'https' : 'http'

const instances: Univer[] = []

declare global {

  interface Window {
    univer?: Univer
    univerAPIA?: FUniver
    univerAPIB?: FUniver
  }
}

function createUniverInstance(containerId: string, rootInjector: Injector) {
  const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: zhCN,
      [LocaleType.EN_US]: enUS,
    },
    override: [
      [IAuthzIoService, null],
      [IUndoRedoService, null],
      [IMentionIOService, null],
    ],
  }, rootInjector)

  const injector = univer.__getInjector()

  const playgroundCollabTestController = rootInjector.get(CollabTestController)
  if (containerId === 'app-b') {
    playgroundCollabTestController.setInjectorAlice(injector)
  } else {
    playgroundCollabTestController.setInjectorBob(injector)
  }

  registerBasicPlugins(univer, containerId)
  registerSheetPlugins(univer)
  registerCollaborationFeatures(univer)
  registerRichFeatures(univer)
  registerRecordFeatures(univer)

  instances.push(univer)

  return univer
}

function createRootInjector() {
  const injector = new Injector([
    [ILocalFileService, { useClass: DesktopLocalFileService }],
    [IUIPartsService, { useClass: UIPartsService }],
    [IMessageService, { useClass: DesktopMessageService }],
    [CollabTestController],
  ])

  return injector
}

function createCollabControlPanel(rootInjector: Injector) {
  const [injectorAlice, injectorBob] = instances.map(univer => univer.__getInjector())

  createRoot(document.getElementById('app-a')!).render(
    <RediContext value={{ injector: rootInjector }}>
      <CollaborationControlPanel
        injectorAlice={injectorAlice}
        injectorBob={injectorBob}
      />
    </RediContext>,
  )
}

if (unit) {
    type ViewId = 'a' | 'b' | 'c'

    const TITLE_MAP: Record<ViewId, string> = {
      a: '',
      b: 'Alice',
      c: 'Bob',
    }

    const App = (
      <Mosaic
        renderTile={(id, path) => (
          <MosaicWindow path={path} title={TITLE_MAP[id]} toolbarControls={<div />}>
            <div id={`app-${id}`} className="univer-h-full" />
          </MosaicWindow>
        )}
        initialValue={{
          direction: 'column',
          first: 'a',
          splitPercentage: 30,
          second: {
            direction: 'row',
            first: 'b',
            second: 'c',
          },
        }}
      />
    )

    const rootInjector = createRootInjector()
    const root = createRoot(document.getElementById('app')!)
    root.render(App)

    setTimeout(() => {
      window.univerAPIA = FUniver.newAPI(createUniverInstance('app-b', rootInjector))
      window.univerAPIB = FUniver.newAPI(createUniverInstance('app-c', rootInjector))

      setTimeout(() => createCollabControlPanel(rootInjector), 2000)
    }, 200)
} else {
  if (type !== '1' && type !== '2') {
    // eslint-disable-next-line no-alert
    window.alert('You should add "type" parameter to the URL, and the value should be "1" or "2".')
  } else {
    fetch(`${httpProtocol}://${host}/universer-api/snapshot/${type}/unit/-/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: +type,
        name: `${isE2E ? '[E2E] ' : ''}${type === '1' ? 'New Doc' : 'New Sheet'} Collaboration Playground ${new Date().toISOString()}`,
        creator: 'user',
        templateID: (isE2E || record) ? 'e2e-template' : null,
      }),
    })
      .then(res => res.json())
      .then((res) => {
        url.searchParams.set('unit', res.unitID)
        url.searchParams.set('type', type as string)

        // refresh the page and will fall into the first if branch
        window.location.href = url.toString()
      })
  }
}
