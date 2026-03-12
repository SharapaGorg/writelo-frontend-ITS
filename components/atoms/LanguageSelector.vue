<template>
  <Select v-model="locale">
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
import {watch} from 'vue'

const {locale} = useI18n({ useScope: 'global' })
const { $trackGoal } = useNuxtApp()

watch(locale, (newVal, oldVal) => {
  localStorage.setItem('preferred-locale', newVal)
  if (oldVal && newVal !== oldVal) {
    $trackGoal('language_switch', { from: oldVal, to: newVal })
  }
})
</script>