<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Calendar, ScanSearch, TrendingUp, MoreHorizontal } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import MoreSheet from './MoreSheet.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const moreOpen = ref(false)

interface BarItem {
  id: 'calendar' | 'video-analyzer' | 'trends'
  icon: typeof Calendar
  label: string
  route: string
}

const items = computed<BarItem[]>(() => [
  { id: 'calendar', icon: Calendar, label: t('sidebar.items.calendar'), route: '/app/calendar' },
  { id: 'video-analyzer', icon: ScanSearch, label: t('sidebar.items.videoAnalyzer'), route: '/app/video-analyzer' },
  { id: 'trends', icon: TrendingUp, label: t('sidebar.items.trends'), route: '/app/trends' },
])

function isActive(item: BarItem) {
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

function navigate(item: BarItem) {
  router.push(item.route)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom);"
  >
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      :class="cn(
        'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors',
        isActive(item) ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
      )"
      @click="navigate(item)"
    >
      <span
        v-if="isActive(item)"
        class="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-brand"
      />
      <component :is="item.icon" class="h-5 w-5" />
      <span class="whitespace-nowrap">{{ item.label }}</span>
    </button>
    <button
      type="button"
      :class="cn(
        'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors',
        moreOpen ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
      )"
      @click="moreOpen = true"
    >
      <MoreHorizontal class="h-5 w-5" />
      <span>{{ t('mobileNav.more') }}</span>
    </button>

    <MoreSheet v-model:open="moreOpen" />
  </nav>
</template>
