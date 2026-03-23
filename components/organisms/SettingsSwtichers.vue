<script setup lang="ts">
import {Switch} from '@/components/ui/switch'
import {toastFeatureUnavailable} from "~/scripts/features/utils/toater";

import {useI18n} from 'vue-i18n'

const {t} = useI18n();

const $settings = useSettings();

const tools = ref([
  // {
  //   key: FeatureType.math,
  //   name: "Математический агент",
  //   enabled: false
  // },
  // {
  //   key: FeatureType.python,
  //   name: "Python интерпретатор",
  //   enabled: false
  // }
])

watch(tools, value => {
  for (let element of value) {
    $settings.setToolState(element.key, element.enabled);
  }

}, {deep: true})

const switchTool = (tool) => {
  if (!$settings.hasFeature(tool.key)) {
    toastFeatureUnavailable(t);
    return;
  }
}

</script>

<template>
  <div class="flex flex-col gap-y-4">
    <div class="flex items-center gap-x-2" v-for="tool in tools" :key="tool.key" @click="switchTool(tool)">
      <div>{{ tool.name }}</div>
      <Switch v-model="tool.enabled" :disabled="!$settings.hasFeature(tool.key)"/>
    </div>
  </div>
</template>
