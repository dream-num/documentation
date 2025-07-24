<script lang="ts" setup>
import type { FUniver, Univer } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '@univerjs/preset-sheets-core/lib/index.css'

const container = ref<HTMLElement | null>(null)
let univerInstance: Univer | null = null
let univerAPIInstance: FUniver | null = null

onMounted(() => {
  const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        UniverPresetSheetsCoreZhCN,
      ),
    },
    presets: [
      UniverSheetsCorePreset({
        container: container.value as HTMLElement,
      }),
    ],
  })
  univerAPI.createWorkbook({})
  univerInstance = univer
  univerAPIInstance = univerAPI
})

onBeforeUnmount(() => {
  univerInstance?.dispose()
  univerAPIInstance?.dispose()
  univerInstance = null
  univerAPIInstance = null
})
</script>

<template>
  <div id="univer" ref="container" />
</template>

<style scoped>
#univer {
  height: 100%;
}
</style>
