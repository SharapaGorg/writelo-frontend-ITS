<template>
  <Select :model-value="locale" @update:model-value="switchLanguage">
    <SelectTrigger class="w-[120px]">
      <SelectValue/>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ru">Русский</SelectItem>
      <SelectItem value="en">English</SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {useI18n} from 'vue-i18n'

const {locale} = useI18n({ useScope: 'global' })
const route = useRoute()
const { $trackGoal } = useNuxtApp()

const landingPaths = ['/', '/en', '/ru', '/landing']

function switchLanguage(newVal: string) {
  if (newVal === locale.value) return

  $trackGoal('language_switch', { from: locale.value, to: newVal })
  localStorage.setItem('preferred-locale', newVal)

  // На landing — редирект на /en или /ru
  if (landingPaths.includes(route.path)) {
    navigateTo(`/${newVal}`)
  } else {
    // В app — просто меняем locale
    locale.value = newVal
  }
}
</script>