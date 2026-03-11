<template>
  <Select v-model="selectedLang">
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
import {computed} from 'vue'

const {locale} = useI18n()

const selectedLang = computed({
  get: () => locale.value,
  set: (val: string) => {
    locale.value = val
    localStorage.setItem('preferred-locale', val)
  }
})
</script>