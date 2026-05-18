<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import type { ShortVideoAnalysisStatus } from '../types'

const props = defineProps<{
  status: ShortVideoAnalysisStatus
}>()

const { t } = useI18n()

const meta = computed(() => {
  switch (props.status) {
    case 'processing':
      return {
        label: t('videoAnalyzer.statuses.processing'),
        icon: Loader2,
        cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
        spin: true,
      }
    case 'completed':
      return {
        label: t('videoAnalyzer.statuses.completed'),
        icon: CheckCircle2,
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
        spin: false,
      }
    case 'failed':
      return {
        label: t('videoAnalyzer.statuses.failed'),
        icon: AlertTriangle,
        cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
        spin: false,
      }
  }
})
</script>

<template>
  <span :class="cn(
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
    meta.cls,
  )">
    <component
      :is="meta.icon"
      :class="cn('h-3 w-3', meta.spin && 'animate-spin')"
    />
    {{ meta.label }}
  </span>
</template>
