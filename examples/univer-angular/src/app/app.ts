import type { ElementRef, OnDestroy, OnInit } from '@angular/core'
import type { FUniver, Univer } from '@univerjs/presets'
import { Component, signal, ViewChild } from '@angular/core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'

import '@univerjs/preset-sheets-core/lib/index.css'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly univer = signal<Univer | null>(null)
  protected readonly univerAPI = signal<FUniver | null>(null)

  @ViewChild('univer', { static: true }) univerContainer!: ElementRef<HTMLDivElement>

  ngOnInit() {
    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          sheetsCoreEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: this.univerContainer.nativeElement,
        }),
      ],
    })

    univerAPI.createWorkbook({})

    this.univer.set(univer)
    this.univerAPI.set(univerAPI)
  }

  ngOnDestroy(): void {
    this.univer()?.dispose()
  }
}
