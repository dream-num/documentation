import type { Dependency } from '@univerjs/presets'
import { Inject, Injector, LocaleService, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/presets'
import { CustomMenuController } from './controllers/custom-menu.controller'
import enUS from './locale/en-US'
import zhCN from './locale/zh-CN'

const SHEET_CUSTOM_MENU_PLUGIN = 'SHEET_CUSTOM_MENU_PLUGIN'

export class UniverSheetsCustomMenuPlugin extends Plugin {
  static override type = UniverInstanceType.UNIVER_SHEET
  static override pluginName = SHEET_CUSTOM_MENU_PLUGIN

  constructor(
    @Inject(Injector) protected readonly _injector: Injector,
    @Inject(LocaleService) private readonly _localeService: LocaleService,
  ) {
    super()

    this._localeService.load({
      enUS,
      zhCN,
    })
  }

  override onStarting(): void {
    ([
      [CustomMenuController],
    ] as Dependency[]).forEach(d => this._injector.add(d))
  }

  override onRendered(): void {
    touchDependencies(this._injector, [
      [CustomMenuController],
    ])
  }
}
