<script>
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import '@univerjs/preset-sheets-core/lib/index.css'

export default {
  mounted() {
    const { univer, univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: mergeLocales(
          UniverPresetSheetsCoreZhCN,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: this.$refs.container,
        }),
      ],
    })
    univerAPI.createWorkbook({})
    this.univerInstance = univer
    this.univerAPIInstance = univerAPI
  },
  beforeUnmount() {
    this.univerInstance?.dispose()
    this.univerAPIInstance?.dispose()
    this.univerInstance = null
    this.univerAPIInstance = null
  },
}
</script>

<template>
  <div id="univer" ref="container" />
</template>

<style>
#univer {
  height: 100%;
}
</style>
